import express from 'express';
import bodyParser from 'body-parser';
import consign from 'consign';
import compression from 'compression';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';

export default class Server {

    prepareApp() {

        const app = express();

        const publicPath = path.join(__dirname, '..', 'app', 'public');
        app.use(express.static(publicPath));
        
        app.use(helmet());
        app.use(compression());
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
        const corsOptions = { 
        };
        app.use(cors(corsOptions));
        app.disable('x-powered-by');

        consign()
            .include('app/routes')
            .then('app/controllers')
            .into(app);

        return app;
    }
}

global.responseLog = (req, res) => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode}`);
};
