
import * as express from 'express';
import * as cors from 'cors';

export const configureCors = (app: express.Application) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://ubatuba-guias.web.app',
    'https://ubatuba-guias.firebaseapp.com'
  ];

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));
  console.log('CORS configurado para aceitar credenciais.');
};
