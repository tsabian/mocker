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

    routeService.getAllRoutes()
    .then(routes => prepare(application, routeService, routes))
    .catch(err => console.log(err));
};

/**
 * 
 * @param {Express} application Set the application
 * @param {RouteService} service set route service
 * @param {any[]} routes set routes
 */
function prepare(application, service, routes) {
    routes.forEach(route => create(application, service, route));
}

/**
 * 
 * @param {Express} application Set the application
 * @param {RouteService} service set route service
 * @param {Object} route Set route object
 */
function create(application, service, route) {
    if (route.context || route.context.length > 0) {
        route.context.forEach(context => {
            const path = `/${context}${route.path}`;
            console.log(`${route.method} ${path}`);
            application[route.method](path, (req, res) => prepareRequest(route, service, req, res));
        });
    } else {
        console.log(`${route.method} ${route.path}`);
        application[route.method](route.path, (req, res) => prepareRequest(route, service, req, res));
    }
}

/**
 * prepare request rotine
 * @param {object} item set route item
 * @param {RouteService} service set route service
 * @param {Request} req set request object
 * @param {Response} res set response object
 */
function prepareRequest(route, service, req, res) {
    
    const headerTypeName = 'contentType';
    const contentType = req.header[headerTypeName];
    const statusException = 500;
    const currentPath = route.path;
    const method = req.method.toLowerCase();
    
    const query = url.parse(req.url, true);
    let findQuery = { };
    if (query) {
        findQuery = JSON.parse(JSON.stringify(query.query));
    }

    let filter = { };
    if (contentType == 'application/json' || contentType == 'text/json') {
        filter = req.body || { };
    } else {
        filter = findQuery || { };
    }

    // TODO: Merge query and params into filter
    if (!query && req.params) {
        filter = req.params || { };
    }

    const id = route._id;

    service.setHeader(id, req.headers);
    service.setQuery(id, findQuery);
    service.setBody(id, req.body);
    service.setParams(id, req.params);

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
