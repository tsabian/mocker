import Server from './config/server';
import MockerService from './app/services/mockerService';
import Environment from './config/environment';

const port = process.env.PORT || 5000;

const environment = new Environment();
const server = new Server();
const service = new MockerService(environment);
let app;

let serverUp = false;

service.initializeCollections()
.then((result) => {
    if (result && result.success) {
        console.log(result);
        serverUp = true;
    }
})
.catch(err => console.log(err))
.finally(() => {
    if (serverUp) {
        app = server.prepareApp();
        app.listen(port, () => {
            console.log(`Server vesion ${process.env.npm_package_version} up listening on port ${port}`);
        });
    } else {
        console.log('Server down');
    }
});
