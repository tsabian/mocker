import Server from './config/server';
import MockerService from './app/services/mockerService';

const port = process.env.PORT || 3000;

const server = new Server();
const app = server.prepareApp();

app.listen(port, () => {
    const service = new MockerService();
    service.initializeCollections();
    console.log(`listening on ${process.env.HOST} ${port}`);
});