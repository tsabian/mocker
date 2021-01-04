import MongoConnection from '../../config/mongo';
import Environment from '../../config/environment';
import { ObjectId } from 'mongodb';

/**
 * Methods Class
 */
export class Methods { }
/**
 * Get verb
 */
Methods.get = 'get';
/**
 * Post verb
 */
Methods.post = 'post';
/**
 * Put verb
 */
Methods.put = 'put';
/**
 * Delete verb
 */
Methods.delete = 'delete';

/**
 * RouteService class
 */
export default class RouteService {

    /**
     * Inicialize new instance of RouteService
     * @param {Environment} environment set environment variables
     * @param {MongoConnection} mongo 
     */
    constructor(environment, mongo = new MongoConnection(environment)) {
        this.mongo = mongo;
    }

    /**
     * Get all elements by routes
     */
    listRoutes() {
        return this.mongo.select(this.mongo.DataBaseName, this.mongo.RouteCollectionName);
    }

    /**
     * Get Routes by object ID
     * @param {string} id Set id to filter routes
     */
    getBy(id) {
        const find = {
            '_id': new ObjectId(id)
        };
        console.log(find);
        return this.mongo.select(this.mongo.DataBaseName, this.mongo.RouteCollectionName, find);
    }

    /**
     * Get all routes
     */
    getAllRoutes() {
        const projection = {
            'path': 1, 
            'method': 1,
            'context': 1
        };
        const find = { }
        return this.mongo.select(this.mongo.DataBaseName, this.mongo.RouteCollectionName, find, projection);
    }

    /**
     * Get Routes by methods
     * @param {Methods} withMethod Set method filter
     */
    getRoutes(withMethod) {
        const projection = {
            'path': 1, 
            'method': 1,
            'context': 1
        };
        const find = {
            'method': {
                '$eq': `${withMethod}`
            }
        };
        return this.mongo.select(this.mongo.DataBaseName, this.mongo.RouteCollectionName, find, projection);
    }

    /**
     * Get Routes by route and method
     * @param {string} route 
     * @param {string} method
     * @param {Object} filter
     */
    getResponse(path, method, filter = {}) {
        let result = {
            statusCode: 304
        };
        const statusException = 500;
        const statusNotFound = 404;
        const statusNotFoundBody = {
            message: `Route not found on collection`,
            route: { 
                path,
                method
            }
        };
        const find = {
            'path': `${path}`,
            'method': `${method}`
        };
        const projection = {
            '_id': 0
        };

        return new Promise((resolve, reject) => { 
            this.mongo.select(this.mongo.DataBaseName, this.mongo.RouteCollectionName, find, projection)
            .then((route) => {
                if (!route || route.length == 0) {
                    result.statusCode = statusNotFound;
                    result.body = statusNotFoundBody;
                    resolve(result);
                } else {
                    try {
                        const firstRoute = route[0];
                        result.statusCode = firstRoute.expectedStatus;
                        const expectedResponse = firstRoute.request.responses.find(expected => expected.status == result.statusCode);
                        if (expectedResponse.responseCollectionName) {
                            const find = expectedResponse.find || filter;
                            this.getCollection(expectedResponse.responseCollectionName, find, expectedResponse.projection, expectedResponse.limit || 0)
                            .then((collectionResult) => {
                                if (collectionResult) {
                                    if (expectedResponse.limit == 0 || expectedResponse.limit > 1) {
                                        result.body = collectionResult;
                                    } else {
                                        result.body = collectionResult[0];
                                    }
                                } else {
                                    result.body = expectedResponse.body;
                                }
                                resolve(result);
                            })
                            .catch((err) => { 
                                console.log('Request fail');
                                result.statusCode = statusException;
                                result.error = err;
                                reject(result);
                            });
                        } else {
                            result.body = expectedResponse.body;
                            resolve(result);
                        }
                    } catch (error) {
                        console.log(error);
                        result.statusCode = statusException;
                        result.error = error;
                        reject(result);
                    }
                }
            })
            .catch((err) => reject(err));
        });
    }

    /**
     * Get collection by collectionName
     * @param {string} collectionName Set collection name
     * @param {string} find Set filter
     * @param {Number} limit Set the limit of collectin, default is 0
     */
    getCollection(collectionName, find, projection, limit = 0) {
        return this.mongo.select(this.mongo.DataBaseName, collectionName, find, projection, limit);
    }

    /**
     * Insert request header values
     * @param {string} id Set collection id
     * @param {Object} keyValues Set header keyvalues
     */
    setHeader(id, keyValues) {
        const update = {
            '$set': { 'request.headers': keyValues }
        };
        this.mongo.update(this.mongo.DataBaseName, this.mongo.RouteCollectionName, id, update)
        .catch((err) => console.log(err));
    }

    /**
     * Insert request query values
     * @param {string} id set route id
     * @param {Object} keyValues set request query values
     */
    setQuery(id, keyValues) {
        const update = {
            '$set': { 'request.query': keyValues }
        };
        this.mongo.update(this.mongo.DataBaseName, this.mongo.RouteCollectionName, id, update)
        .catch((err) => console.log(err));
    }

    /**
     * Insert body values
     * @param {string} id set route id
     * @param {Object} object set request body values
     */
    setBody(id, object) {
        const update = {
            '$set': { 'request.body': object }
        };
        this.mongo.update(this.mongo.DataBaseName, this.mongo.RouteCollectionName, id, update)
        .catch((err) => console.log(err));
    }

    /**
     * Insert params values
     * @param {string} id set route id
     * @param {Object} object set request body values
     */
    setParams(id, object) {
        const update = {
            '$set': { 'request.params': object }
        };
        this.mongo.update(this.mongo.DataBaseName, this.mongo.RouteCollectionName, id, update)
        .catch((err) => console.log(err));
    }

}