import RouteService, { Methods } from '../services/routesService';
import url from 'url';
import { Request, Response } from 'express';

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
    
    const statusException = 500;
    const statusNotFound = 404;
    const statusNotFoundBody = {
        message: `Route not found on collection`
    };
    const currentPath = item.route;
    const method = req.method.toLowerCase();
    const headerTypeName = 'contentType';
    const contentType = req.header[headerTypeName];

    service.getResponse(currentPath, method)
    .then((route) => {
        
        if (!route || route.length == 0) {
            return prepareResponse(res, statusNotFound, statusNotFoundBody);
        }

        try {
            
            const firstRoute = route[0];
            const expectedStatus = firstRoute.expectedStatus;
            const expectedResponse = firstRoute.request.responses.find(expected => expected.status == expectedStatus);
            
            if (expectedResponse.responseCollectionName) {
                let find = {};
                
                if (!expectedResponse.find) {
                    if (contentType == 'application/json' || contentType == 'text/json') {
                        find = req.body || {};
                    } else {
                        const query = url.parse(req.url, true);
                        if (query) {
                            const findQuery = JSON.parse(JSON.stringify(query.query));
                            find = findQuery || { };
                        }
                    }
                    
                } else {
                    find = expectedResponse.find;
                }

                service.getCollection(expectedResponse.responseCollectionName, find, expectedResponse.projection)
                .then((collectionResult) => {
                    if (collectionResult) { 
                        return prepareResponse(res, expectedStatus, collectionResult);
                    } else {
                        if (expectedResponse.body) {
                            return prepareResponse(res, expectedStatus, expectedResponse.body);
                        }
                        return prepareResponse(res, expectedStatus);
                    }
                })
                .catch((err) => { 
                    console.log('Request fail');
                    console.log(err);
                    return prepareResponse(res, statusException);
                });

            } else {
                return prepareResponse(res, expectedStatus, expectedResponse.body);
            }
        } catch (err) {
            return prepareResponse(res, statusException, err);
        }
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
