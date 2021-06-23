import RouteService from '../services/routesService';
import url from 'url';
import Environment from '../../config/environment';
import { response } from 'express';
import { time } from 'console';

/**
 * App Route export
 * @param {Express} application set express application
 * @param {Environment} environment
 * @param {RouteService} routeService set route service injection
 */
module.exports = function AppRoute(application,
    environment = new Environment(),
    routeService = new RouteService(environment)) {

    application.get('/api/route', (req, res) => {
        application.app.controllers.routeController.route(routeService, req, res);
    });
    application.get('/api/route/:id', (req, res) => {
        application.app.controllers.routeController.routeById(routeService, req, res);
    });

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
    if (!route.context || route.context.length == 0) {
        console.log(`${route.method} ${route.path}`);
        application[route.method](route.path, (req, res) => prepareRequest(route, service, req, res));
    } else {
        route.context.forEach(context => {
            let current = '';
            if (context) {
                current = context.startsWith('/', 0) ? `${context}` : `/${context}`;
            }
            const path = `${current}${route.path}`;
            console.log(`${route.method} ${path}`);
            application[route.method](path, (req, res) => prepareRequest(route, service, req, res));
        });
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
    let findQuery = {};
    if (query) {
        findQuery = JSON.parse(JSON.stringify(query.query));
    }

    let filter = {};
    if (contentType === 'application/json' || contentType === 'text/json') {
        filter = req.body || {};
    } else {
        filter = findQuery || {};
    }

    const params = req.params;
    if (params) {
        for (var key in params) {
            filter[key] = params[key];
        }
    }
    const id = route._id;

    service.setHeader(id, req.headers);
    service.setQuery(id, findQuery);
    service.setBody(id, req.body);
    service.setParams(id, req.params);

    service.getResponse(currentPath, method, filter)
        .then((result) => {
            return prepareResponse(res, result.statusCode, result.body, result.timeoutMilleseconds);
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
 * @param {Response}    res                     Set response object
 * @param {Number}      status                  Set http status code
 * @param {Object}      body                    Set body result
 * @param {Number}      timeoutMilleseconds     Set timeou in milleseconds
 * @returns return the Promise<any>
 */
function prepareResponse(res, status, body = null, timeoutMilleseconds = 0) {
    if (timeoutMilleseconds && timeoutMilleseconds > 0) {
        sleep(timeoutMilleseconds, body).then((body) => {
            prepareResult(res, status, body);
        })
    } else {
        prepareResult(res, status, body);
    }
}

/**
 * Sleep, timeout milleseconds
 * @param {Number} milleseconds 
 * @param {Object} body 
 * @returns Promise object
 */
function sleep(milleseconds, body) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(body);
        }, milleseconds);
    });
}

/**
 * Prepare result of response
 * @param {Response}    res     Set response object
 * @param {Number}      status  Set response object
 * @param {Object}      body    Set body result
 * @returns Json result
 */
function prepareResult(res, status, body) {
    if (!body) {
        return res.status(status).json();
    }
    return res.status(status).json(body);
}
