module.exports = function(application) {
    application.get('/', (req, res) => {
        console.log('ok');
        return res.status(200).json({"status": "ok"});
    });
}
