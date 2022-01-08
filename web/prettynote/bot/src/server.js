const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const mustache = require("mustache")
const { isOverLimit, enqueue, logRequest } = require("./redis");

const submitPage = fs.readFileSync(path.join(__dirname, 'submit.html')).toString()
const RATE_LIMIT = 30000;

const isValidURL = (input) => {
    try {
        let url = new URL(input);
        if (url.protocol != "http:" && url.protocol != "https:") {
            return false;
        }
    } catch (err) {
        return false;
    }
    return true;
}

app.use(express.urlencoded({ extended: false }));

app.get("/", (_, res) => {
    const page = mustache.render(submitPage, {
        challenge_name: "Prettynote",
    })
    return res.send(page);
});

app.post('/', async (req, res) => {
    let { url } = req.body;
    if (isValidURL(url)) {
        const ip = req.socket.remoteAddress;
        const curr = Date.now();
        const overLimit = await isOverLimit(ip, curr, RATE_LIMIT);
        if (overLimit) {
            const page = mustache.render(submitPage, {
                challenge_name: "Prettynote",
                msg: "Too many request",
                url: url
            })
            return res.status(429).send(page);

        } else {
            await logRequest(ip, curr)
                .then(() =>
                    enqueue(url)
                );
        }

        const page = mustache.render(submitPage, {
            challenge_name: "Prettynote",
            msg: "Successfully Submitted",
            url: url
        })

        return res.send(page);
    } else {
        const page = mustache.render(submitPage, {
            challenge_name: "Prettynote",
            msg: "Not a valid url",
            url: url
        })
        return res.status(401).send(page);
    }
});


app.listen(8000, () => {
    console.log("Listening at port 8000")
});
