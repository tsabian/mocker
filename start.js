import Server from './config/server';
import MockerService from './app/services/mockerService';

const port = process.env.PORT || 3000;

const service = new MockerService();
const server = new Server();
const app = server.prepareApp();

let serverUp = false;

service.initializeCollections()
.then((result) => {
    if (result && result.success) {
        console.log(result);
        serverUp = true;
    } else {
        console.log('Server down');
    }
})
.catch(err => console.log(err))
.finally(() => {
    if (serverUp) {
        app.listen(port, () => {
            console.log(`Server up listening on port ${port}`);
        });
    }
});
