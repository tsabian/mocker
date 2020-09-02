import RouteService, { Methods } from '../services/routesService';
import url from 'url';
import { Request, Response } from 'express';
import Environment from '../../config/environment';

/**
 * 
 * @param {Express} application set express application
 * @param {Environment} environment
 * @param {RouteService} routeService set route service injection
 */
module.exports = async function(application, 
                                environment = new Environment(), 
                                routeService = new RouteService(environment)) {

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
};

/**
 * prepare get routes
 * @param {Express} application set express application
 * @param {RouteService} service set route service
 * @param {any[]} routes set routes
 */
function prepareGet(application, service, routes) {
    routes.forEach(item => {
        writeRoute(item);
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
        writeRoute(item);
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
        writeRoute(item);
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
        writeRoute(item);
        application.delete(item.route, (req, res) => prepareRequest(item, service, req, res));
    });
}

/**
 * Write in console a item route
 * @param {Object} item Set the route object
 */
function writeRoute(item) {
    console.log(`${item.method} ${item.route}`);
}

/**
 * prepare request rotine
 * @param {object} item set route item
 * @param {RouteService} service set route service
 * @param {Request} req set request object
 * @param {Response} res set response object
 */
function prepareRequest(item, service, req, res) {
    
    const headerTypeName = 'contentType';
    const contentType = req.header[headerTypeName];
    const statusException = 500;
    const currentPath = item.route;
    const method = req.method.toLowerCase();
    
    const query = url.parse(req.url, true);
    let findQuery = { };
    if (query) {
        findQuery = JSON.parse(JSON.stringify(query.query));
    }

    let filter = {};
    if (contentType == 'application/json' || contentType == 'text/json') {
        filter = req.body || {};
    } else {
        filter = findQuery || { };
    }

    service.setHeader(item._id, req.headers);
    service.setQuery(item._id, findQuery);
    service.setBody(item._id, req.body);

    service.getResponse(currentPath, method, filter)
    .then((result) => {

        return prepareResponse(res, result.statusCode, result.body);

    })
    .catch(err => {
        return prepareResponse(res, statusException, err);
    })
    .finally(() => {
        responseLog(req, res);    
    });
}

/**
 * Extension for prepare response result
 * @param {Response}    res     Set response object
 * @param {Number}      status  Set http status code
 * @param {Object}      body    Set body result
 * @returns return the Promise<any>
 */
function prepareResponse(res, status, body = null) {
    if (!body) {
        return res.status(status).json();
    }
    return res.status(status).json(body);
}
