var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();


/**============routs================ */
var indexRouter = require('./routes/test');
var usersRouter = require('./routes/users');

/**============routs end================ */


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.json());

const nodemailer = require('nodemailer'); //модуль для отправки писем клиетну и манагеру

let mysql = require('mysql');
let con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Parvus888Mir',
    database: 'market'
});

app.listen(3000, function() {
    console.log('node express worcing on port 3000');

});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/** =============rout path========= */


app.use('/', indexRouter);
app.use('/users', usersRouter);
/** =============rout path========= */

// catch 404 and forward to error 
app.use(function(req, res, next) {
    next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;