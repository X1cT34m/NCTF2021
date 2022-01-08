const express = require('express');
const { isValidURL } = require('../utils');
const { enqueue, logRequest, isOverLimit } = require('../helper/redis');
const path = require('path');
const router = express.Router();

const RATE_LIMIT = 10000;

router.get('/', (_, res) => {
    return res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.get('/code', (req, res) => {
    let token = req.signedCookies['token'];
    if (token && token.username) {
        return res.sendFile(path.join(__dirname, '../views/template.html'));
    } else {
        return res.json({ msg: 'Plz Login first!' });
    }
});

router.get('/report', (_, res) => {
    return res.sendFile(path.join(__dirname, '../views/report.html'));
});

router.post('/report', async (req, res) => {
    let { url } = req.body;
    if (typeof url === "string" && isValidURL(url)) {
        
        const currTime = Date.now()
        const ip = req.headers['x-real-ip']

        let overlimit = await isOverLimit(ip, currTime, RATE_LIMIT);
        
        if (overlimit) {
            return res.sendStatus(429);
        }
        
        await logRequest(ip, currTime).then(() => enqueue(url));

        return res.json({ msg: "Successfully submit your url" });
    } else {
        return res.json({ msg: "Failed to submit url" });
    }
});


module.exports = router;
