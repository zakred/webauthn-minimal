const axios = require("axios");
const url = require("url");

/**
 * Service to interact with WSO2 Identity server.
 */
class Wso2Service {
    SCOPE = "openid";

    constructor(wso2Fqdn, redirectCallback, clientId, clientSecret) {
        this.wso2Fqdn = wso2Fqdn;
        this.redirectCallback = redirectCallback;
        this.clientId = clientId;
        this.clientSecret = clientSecret;

        this.WSO2_AUTH_URL = this.wso2Fqdn + "/oauth2/authorize";
        this.WSO2_COMMON_AUTH_URL = this.wso2Fqdn + "/commonauth";
        this.WSO2_TOKEN_URL = this.wso2Fqdn + "/oauth2/token";
    }

    base64UrlToBase64 = (base64Url) =>
        base64Url.replace(/\-/g, "+").replace(/_/g, "/") +
        "=".repeat(base64Url.length % 4 ? 4 - (base64Url.length % 4) : 0);
    #handleHttpError(e) {
        if (e.response) {
            console.log(`Status: ${e.response.status}`);
            console.log(`Body: ${JSON.stringify(e.response.data, 0, 4)}`);
        }
        const ret = {
            message: e.message ?? "Error",
        };
        if (e.response && e.response.data) {
            ret.data = e.response.data;
        }
        return ret;
    }

    /**
     * Trigger authentication.
     *
     * @returns {Promise<{message: string}|any>} payload with challenge
     */
    startAuthentication = async () => {
        const formData = new URLSearchParams();
        formData.append("response_type", "code");
        formData.append("client_id", this.clientId);
        formData.append("redirect_uri", this.redirectCallback);
        formData.append("nonce", "asd");
        formData.append("scope", this.SCOPE);

        const config = {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            maxRedirects: 0,
        };

        try {
            return await axios.post(this.WSO2_AUTH_URL, formData, config);
        } catch (e) {
            const resp = e.response;
            if (resp.status === 302) {
                const queryParams = url.parse(
                    resp.headers.location,
                    true,
                ).query;
                const data = JSON.parse(queryParams.data);
                data.sessionDataKey = queryParams.sessionDataKey;
                data.publicKeyCredentialRequestOptions.challenge =
                    this.base64UrlToBase64(
                        data.publicKeyCredentialRequestOptions.challenge,
                    );
                return data;
            }
            return this.#handleHttpError(e);
        }
    };

    /**
     * Calls the FIDO authenticator with the signed challenge.
     *
     * @param req tokenResponse payload
     * @returns {Promise<{message: string}|any>} Location URI to the callback
     */
    commonAuth = async (req) => {
        console.log(req);
        const formData = new URLSearchParams();
        formData.append("sessionDataKey", req.sessionDataKey);
        formData.append("tokenResponse", JSON.stringify(req.tokenResponse));

        const config = {
            maxRedirects: 0,
            auth: {
                username: this.clientId,
                password: this.clientSecret,
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        };

        try {
            return await axios.post(
                this.WSO2_COMMON_AUTH_URL,
                formData,
                config,
            );
        } catch (e) {
            const resp = e.response;
            if (resp.status === 302) {
                return resp.headers.location;
            }
            return this.#handleHttpError(e);
        }
    };

    /**
     * Follows the redirection URI to retrieve the authorization code.
     *
     * @param redirectLocationUri redirection URI
     * @returns {string} authorization code
     */
    getCode = async (redirectLocationUri) => {
        const config = {
            maxRedirects: 0,
            auth: {
                username: this.clientId,
                password: this.clientSecret,
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        };

        try {
            return await axios.get(redirectLocationUri, config);
        } catch (e) {
            const resp = e.response;
            if (resp.status === 302) {
                const queryParams = url.parse(
                    resp.headers.location,
                    true,
                ).query;
                return queryParams.code;
            }
            return this.#handleHttpError(e);
        }
    };

    /**
     * Get the tokens using the authorized code.
     *
     * @param authorization_code authorized code
     * @returns {Promise<{message: string}|any>} response with tokens
     */
    getTokens = async (authorization_code) => {
        const formData = new URLSearchParams();
        formData.append("grant_type", "authorization_code");
        formData.append("redirect_uri", this.redirectCallback);
        formData.append("code", authorization_code);

        const config = {
            auth: {
                username: this.clientId,
                password: this.clientSecret,
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        };

        try {
            const resp = await axios.post(
                this.WSO2_TOKEN_URL,
                formData,
                config,
            );
            return resp.data;
        } catch (e) {
            return this.#handleHttpError(e);
        }
    };
}

module.exports = Wso2Service;
