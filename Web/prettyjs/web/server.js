require('dotenv').config();

const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const createError = require('http-errors');
const { sameOrigin } = require('./utils');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(logger('dev'));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser(process.env.COOKIE_SECRET));


app.use('/', indexRouter);
app.use('/api', sameOrigin, apiRouter);

app.use((_req, _res, next) => {
    next(createError(404));
});

app.use((err, _req, res, _next) => {
    return res.status(err.status || 500).json({
        error: err.message,
    });
})

app.listen(PORT, () => {
    console.log(`Listening at port 8000`);
});