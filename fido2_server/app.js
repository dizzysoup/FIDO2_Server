import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import createError from 'http-errors';
import cors from 'cors';

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import FIDORouter from './routes/webauthn.js';

const app = express();

// view engine setup
app.set('views', path.join(path.dirname(new URL(import.meta.url).pathname), 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: '*'}));
app.use(express.static(path.join(path.dirname(new URL(import.meta.url).pathname), 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/webauth', FIDORouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
