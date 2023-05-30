require('dotenv').config();
import express, { Request, Response, json, urlencoded } from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import morgan from 'morgan';
import ColorService from './libs/services/ColorService';
import EnvironmentService from './libs/services/EnvironmentService';
import ExpressService from './libs/services/ExpressService';
import MySQLService from './libs/services/MySQLService';
import { ColorEnum } from './libs/services/types';
import S3Route from './routes/S3Route';

// * Get the express application instance.
const app = ExpressService.app;

// * Connect to MySQL.
MySQLService.connection.connect((error) => {
  if (error) {
    ColorService.logText(
      ColorEnum.FgRed,
      'Something is wrong. Server is not connected to MySQL.'
    );
  }

  if (!error) {
    ColorService.logText(ColorEnum.FgBlue, 'Server is connected to MySQL');
  }
});

// * Connect to mongodb.
mongoose
  .connect(EnvironmentService.MONGODB_URI ?? '', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions)
  .then(() => {
    ColorService.logText(ColorEnum.FgYellow, `Server is connected to MongoD`);
  })
  .catch(() => {
    ColorService.logText(
      ColorEnum.FgRed,
      `Something is wrong. Server is not connected to MongoDB.`
    );
  });

// * Server middlewares.
app.use(morgan('tiny'));
app.use(express.static('public'));
app.use(json());
app.use(urlencoded({ extended: true }));

// * Server root endpoint.
app.get('/', (_: Request, res: Response) => {
  res.sendFile('index.html', { root: 'public' });
});

// * Server other endpoints.
app.use('/api/s3', S3Route);

// * Separate app and server.
export default app;