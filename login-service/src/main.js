const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const https = require('https');
const axios = require("axios");
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});
axios.defaults.httpsAgent = httpsAgent;

const SERVER_PORT = process.env.SERVER_PORT || 3000;
const CLIENT_ID = process.env.CLIENT_ID || '_2dFjRlLCZPPbV4EnbL02AXIy6Ya';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'ywbDEJDPuQFfhtocdArLIkTex18a';
const REDIRECT_CALLBACK_FQDN = process.env.CALLBACK_FQDN || 'http://localhost:3000/callback';
const WSO2_FQDN = process.env.WSO2_FQDN || 'https://localhost:9443';
const CONTEXT_PATH = process.env.CONTEXT_PATH || '/';

const Wso2Service = require('./wso2-service');
const wso2Service = new Wso2Service(WSO2_FQDN, REDIRECT_CALLBACK_FQDN, CLIENT_ID, CLIENT_SECRET);

const asyncHandler = fn => (req, res, next) => {
    return Promise
        .resolve(fn(req, res, next))
        .catch(next);
};

const app = express();
const router = express.Router();
app.use(cors());
app.use(express.json())
app.use(morgan('dev'))
app.use(CONTEXT_PATH, router);

router.post('/login/webauthn/start', asyncHandler(async (req, res) => {
    try {
        let result = await wso2Service.startAuthentication();
        res.status(200).json(result ?? {error: 'no response'});
    } catch (e) {
        res.status(500).json({
            message: e.message ?? 'Error',
            data: e.data ?? ''
        });
    }
}));

router.post('/login/webauthn/signed-challenge', asyncHandler(async (req, res) => {
    try {
        let redirectUri = await wso2Service.commonAuth(req.body);
        let code = await wso2Service.getCode(redirectUri);
        let tokens = await wso2Service.getTokens(code);
        res.status(200).json(tokens ?? {error: 'no response'});
    } catch (e) {
        res.status(500).json({
            message: e.message ?? 'Error',
            data: e.data ?? ''
        });
    }
}));

app.listen(SERVER_PORT, () => {
    console.log(`Server listening on port ${SERVER_PORT}`);
});