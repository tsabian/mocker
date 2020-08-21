import Server from './config/server';
import MockerService from './app/services/mockerService';

const port = process.env.PORT || 3000;

const service = new MockerService();
const server = new Server();
const app = server.prepareApp();

service.initializeCollections()
.then((result) => {
    if (result && result.success) {
        app.listen(port, () => {
            console.log(`Server up listening on port ${port}`);
        });
        console.log(result);
    } else {
        console.log('Server down');
    }
})
.catch(err => console.log(err));
