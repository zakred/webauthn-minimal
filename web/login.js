//const LOGIN_SERVER_FQDN = 'http://localhost:3000';
const LOGIN_SERVER_FQDN = '@@LOGIN_SERVER_FQDN@@';
const LOGIN_WEBAUTHN_URL = LOGIN_SERVER_FQDN + '/login/webauthn/start'
const LOGIN_WEBAUTHN_SIGNED_URL = LOGIN_SERVER_FQDN + '/login/webauthn/signed-challenge'
const base64ToArr = (base64) => Uint8Array.from(atob(base64), c => c.charCodeAt(0));
const base64ToBase64URL = (base64) => base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');

function _arrayBufferToBase64Url(buffer) {
    return base64ToBase64URL(_arrayBufferToBase64(buffer));
}
function _arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

/**
 * Start the authentication by requesting the challenge to the backend.
 *
 * @returns {Promise<*>} data from server with public credential request options
 */
const startAuth = async function () {
    const config = {};
    const res = await axios.post(LOGIN_WEBAUTHN_URL, {}, config);
    console.log(res.data);
    return res.data;
}

/**
 * Trigger browser security device signing process.
 * The challenge will be transformed to an array, see {@link https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/get#publickey_object_structure|Mozilla}
 *
 * @param data data from backend
 * @returns {Promise<Credential>} credential assertion
 */
const signChallenge = async function (data) {
    try {
        data.publicKeyCredentialRequestOptions.challenge = base64ToArr(data.publicKeyCredentialRequestOptions.challenge);
    } catch (e){
        console.log(`If signing twice it will fail since it has been converted already.: \`${e.message}`)
    }
    const assertion = await navigator.credentials.get({
        publicKey: data.publicKeyCredentialRequestOptions
    });
    console.log(assertion)
    return assertion;
}

/**
 * Send back to the backend server the signed challenge response, it will also
 * convert the response ArrayBuffer values to base64, URL encoded.
 *
 * @param authStartData data retrieved when requested the challenge
 * @param assertion response object from signing challenge
 * @returns {Promise<*>} object in a format expected in our backend
 */
const sendSignedChallenge = async function (authStartData, assertion){
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const data = {
        sessionDataKey: authStartData.sessionDataKey,
        tokenResponse: {
            requestId: authStartData.requestId,
            credential: {
                id: assertion.id,
                response: {
                    authenticatorData: _arrayBufferToBase64Url(assertion.response.authenticatorData),
                    clientDataJSON: _arrayBufferToBase64Url(assertion.response.clientDataJSON),
                    signature: _arrayBufferToBase64Url(assertion.response.signature),
                    userHandle: new TextDecoder('utf-8').decode(assertion.response.userHandle)
                },
                type: assertion.type,
                clientExtensionResults: {}
            }
        }
    }
    const res = await axios.post(LOGIN_WEBAUTHN_SIGNED_URL, data, config);
    console.log(res.data);
    return res.data;
}