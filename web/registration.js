const base64ToBase64URL = (base64) => base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
const base64UrlToBase64 = (base64Url) => base64Url.replace(/\-/g, '+').replace(/_/g, '/') + '='.repeat((base64Url.length % 4) ? 4 - (base64Url.length % 4) : 0);
const base64ToArr = (base64) => Uint8Array.from(atob(base64), c => c.charCodeAt(0));

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
 * Parse the AuthData bytes, check out the data structure: {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API/Authenticator_data#data_structure Mozilla}.
 *
 * @param {ArrayBuffer} authDataRaw raw data bytes
 * @returns {{}} parsed object
 */
function parseAuthData(authDataRaw) {
    const ATTESTED_CRED_DATA_FLAG = 1 << 6;
    const EXTENSION_DATA_FLAG = 1 << 7;

    const ad = authDataRaw;
    let offset = 0;
    let res = {};
    res.extensions = {};

    res.rpIdHash = ad.slice(offset, offset + 32);
    offset += 32;

    res.flags = new Uint8Array(ad.slice(offset, offset + 1))[0];
    offset++;

    res.signCount = ad.slice(offset, offset + 4);
    offset += 4;

    const isAttestedPresent = (res.flags & ATTESTED_CRED_DATA_FLAG) !== 0;
    const isExtensionPresent = (res.flags & EXTENSION_DATA_FLAG) !== 0;
    if (isAttestedPresent) {
        res.AAGUID = ad.slice(offset, offset + 16);
        offset += 16;

        res.credentialIdLength = new DataView(ad.slice(offset, offset + 2)).getInt16(0);
        offset += 2;

        res.credentialId = ad.slice(offset, offset + res.credentialIdLength);
        offset += res.credentialIdLength;

        const credentialPublicKeyBytes = ad.slice(offset);
        const cbor_result = CBOR.decode(credentialPublicKeyBytes);
        res.credentialPublicKey = cbor_result.decoded;
        offset += cbor_result.length;

        if (isExtensionPresent) {
            const extensionBytes = ad.slice(offset);
            const extension_cbor = CBOR.decode(extensionBytes);
            res.extensions = extension_cbor.decoded;
        }
    } else if (isExtensionPresent) {
        const extensionBytes = ad.slice(offset);
        const extension_cbor = CBOR.decode(extensionBytes);
        res.extensions = extension_cbor.decoded;
    }

    return res;
}

const registerDevice = async function (wsoStartRegResponse) {
    const regResponse = JSON.parse(wsoStartRegResponse);
    const publicKey = regResponse.publicKeyCredentialCreationOptions;

    publicKey.user.id = Uint8Array.from(publicKey.user.id, c => c.charCodeAt(0));
    publicKey.challenge = base64ToArr(base64UrlToBase64(publicKey.challenge));

    if (publicKey.excludeCredentials) {
        publicKey.excludeCredentials.forEach(cred => {
            cred.id = Uint8Array.from(cred.id, c => c.charCodeAt(0));
        })
    }

    const publicKeyCredential = await navigator.credentials
        .create({publicKey, sameOriginWithAncestors: true})
        .catch(console.log);
    console.log(publicKeyCredential);

    const response = publicKeyCredential.response;

    // Access attestationObject ArrayBuffer
    const attestationObj = response.attestationObject;

    // Access client JSON
    const clientJSON = response.clientDataJSON;

    // Authenticator data ArrayBuffer
    const authenticatorData = response.getAuthenticatorData();
    const authDataObj = parseAuthData(authenticatorData);

    // Public key ArrayBuffer
    const pk = response.getPublicKey();

    // Public key algorithm identifier
    const pkAlgo = response.getPublicKeyAlgorithm();

    // Permissible transports array
    const transports = response.getTransports();

    console.log(`id: ${base64ToBase64URL(publicKeyCredential.id)}`)
    console.log(`attestationObj: ${_arrayBufferToBase64Url(attestationObj)}`);
    console.log(`clientJSON: ${_arrayBufferToBase64Url(clientJSON)}`);
    console.log(`authenticatorData: ${_arrayBufferToBase64(authenticatorData)}`);
    console.log(`extensions: ${JSON.stringify(authDataObj.extensions)}`);
    console.log(`publicKey: ${_arrayBufferToBase64(pk)}`);
    console.log(`publicKeyAlgorithm: ${pkAlgo}`);
    console.log(`transports: ${_arrayBufferToBase64(transports)}`);

    return {
        "requestId": regResponse.requestId,
        "credential": {
            "id": base64ToBase64URL(publicKeyCredential.id),
            "response": {
                "attestationObject": _arrayBufferToBase64Url(attestationObj),
                "clientDataJSON": _arrayBufferToBase64Url(clientJSON)
            },
            "clientExtensionResults": authDataObj.extensions,
            "type": publicKeyCredential.type
        }
    };
}