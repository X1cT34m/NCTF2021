const express = require('express');
const router = express.Router();

const cookieOptions = {
    signed: true,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 900000
}

router.post('/login', (req, res) => {
    let { username } = req.body;
    if (typeof (username) != 'string') {
        return res.send('Parameters error');
    }
    if (/^\s*$/.test(username)) {
        return res.send({ msg: `Username can't be empty.` });
    }

    if (username === process.env.ADMIN_USERNAME) {
        res.cookie('token', { username: username, data: 'flag' }, cookieOptions);
    } else {
        res.cookie('token', { username: username }, cookieOptions);
    }
    return res.redirect('/code');
});

router.post('/template', (req, res) => {
    let { username } = req.body;
    if (typeof (username) != 'string' || username.length == 0) {
        return res.send('Parameters error');
    }
    if (/[\/]/g.test(username)) {
        return res.send({ msg: 'No need to add split line , right ?' })
    }
    let param1, param2;
    let token = req.signedCookies['token'];
    if (token.data === 'flag' && token.username === process.env.ADMIN_USERNAME) {
        param1 = process.env.ADMIN_USERNAME;
        param2 = process.env.COOKIE_SECRET;
    } else {
        param1 = 'SECRET';
        param2 = 'Not that ez';
    }
    return res.send(`${username} 's Awesome experss page! Check below 👇
//////////////////////////////////////////////////////////////////////

const express = require("express");
const app = express();
const session = require("express-session")
const randomize = require("randomatic");

app.use(session({
    name: "session",
    secret: randomize("aA0", 30),
    resave: false,
    saveUninitialized: false
}))

const PORT = 3000 || ${process.env.PORT};

const setFlag = (data) => {
    global.flag = "Done";
}

app.all("/", (req, res) => {
    if (req.session.AccessGranted) {
        req.session.AccessGranted = false;
    }
    return res.send("Template yourself as simple as possible.")
})


app.get("/flag", (_, res) => {
    global.process.env.${param1}.setFlag("${param2}")
    return res.send("flag is here");
})


app.listen(PORT, "${process.env.HOST}", () => {
    console.log("Listenig at port \${PORT}")
});
//////////////////////////////////////////////////////////////////////`);
});

router.get('/flag', (req, res) => {
    let token = req.signedCookies['token'];
    if (token && token.username === process.env.ADMIN_USERNAME && token.data === "readflag") {
        return res.send({ msg: process.env.FLAG });
    } else {
        return res.status(403).send({ msg: 'Not qualified...' });
    }
});


module.exports = router;