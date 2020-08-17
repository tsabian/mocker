import RouteService, { Methods } from '../services/routesService';

/**
 * 
 * @param {Express} application set express application
 * @param {RouteService} routeService set route service injection
 */
module.exports = async function(application, routeService = new RouteService()) {
    
    routeService.getRoutes(Methods.get)
    .then(routes => prepareGet(application, routeService, routes))
    .catch(err => console.log(err));

    routeService.getRoutes(Methods.post)
    .then(routes => preparePost(application, routeService, routes))
    .catch(err => console.log(err));

    routeService.getRoutes(Methods.put)
    .then(routes => preparePut(application, routeService, routes))
    .catch(err => console.log(err));

    routeService.getRoutes(Methods.delete)
    .then(routes => prepareDelete(application, routeService, routes))
    .catch(err => console.log(err));
}

/**
 * prepare get routes
 * @param {Express} application set express application
 * @param {RouteService} service set route service
 * @param {any[]} routes set routes
 */
function prepareGet(application, service, routes) {
    routes.forEach(item => { 
        application.get(item.route, (req, res) => prepareRequest(item, service, req, res));
    });   
}

/**
 * prepare post routes
 * @param {Express} application set express application
 * @param {RouteService} service set route service
 * @param {any[]} routes set routes
 */
function preparePost(application, service, routes) {
    routes.forEach(item => { 
        application.post(item.route, (req, res) => prepareRequest(item, service, req, res));
    });
}

/**
 * prepare put routes
 * @param {Express} application set express application
 * @param {RouteService} service set route service
 * @param {any[]} routes set routes
 */
function preparePut(application, service, routes) {
    routes.forEach(item => { 
        application.put(item.route, (req, res) => prepareRequest(item, service, req, res));
    });
}

/**
 * prepare delete routes
 * @param {Express} application set express application
 * @param {RouteService} service set route service
 * @param {any[]} routes set routes
 */
function prepareDelete(application, service, routes) {
    routes.forEach(item => { 
        application.delete(item.route, (req, res) => prepareRequest(item, service, req, res));
    });
}

/**
 * prepare request rotine
 * @param {object} item set route item
 * @param {RouteService} service set route service
 * @param {Request} req set request object
 * @param {Response} res set response object
 */
function prepareRequest(item, service, req, res) {
    const statusException = 500;
    const statusNotFound = 400;
    const currentPath = item.route;
    const method = req.method;
    service.setResponse(currentPath, method.toLowerCase())
    .then((response) => {
        if (!response) {
            return res.status(statusNotFound);
        }
        try {
            return res.status(200).json();
        } catch (err) {
            return res.status(statusException).json(err);
        }
    })
    .catch(err => {
        return res.status(statusException).json(err);
    })
    .finally(() => {
        responseLog(req, res);    
    });
}
