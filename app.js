const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars')
const userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var db = require('./config/connection')
var app = express();
var session= require('express-session')
var nocache = require('nocache')
var fileUpload = require('express-fileupload')
const dotenv = require("dotenv")
dotenv.config();

const {errorHandler} = require('./middleware/error-handler');
// view engine setup
app.use(nocache())
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({helpers:{
  inc: function(value,options){
    return parseInt(value)+1;
  }
},extname:'hbs',defaultLayout:'userLayout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(errorHandler)
app.use(fileUpload())
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret:"gfvfdrvd56evdxdxf45v55Q3SEWSRESRESdcxfdxfcfvcffvfbfrdcecsrederERRDRDTDFDDXDCWSWSdsrdx56t56",
  cookie:{maxAge:8000000
  }}))
db.connect((err)=>{
  if(err)
  console.log('Connection failed');
  else
  console.log('Database connected ');
})

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
 res.render("error/error")
});

// error handler
 app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error/error504');
});

// app.use(errorHandler)
module.exports = app;
