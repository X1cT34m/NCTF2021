const { URL } = require('url');

const sameOrigin = async (req, res, next) => {
    if (req.get('referer') && !req.get('referer').startsWith(process.env.SITE_URL)) {
        return res.status(403).json({ msg: 'SameOrigin Protection' })
    }
    next();
}

const isValidURL = (url) => {
    try {
        url = new URL(url);
        if (url.protocol != "http:" && url.protocol != "https:") return false;
    } catch (err) {
        return false;
    }
    return true;
}

module.exports = {
    sameOrigin,
    isValidURL
}
