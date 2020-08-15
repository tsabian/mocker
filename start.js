import Server from './config/server';

const port = process.env.PORT || 3000;

const server = new Server();
const app = server.prepareApp();

app.listen(port, () => {
    console.log(`listening on ${process.env.HOST} ${port}`);
});