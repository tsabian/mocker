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

    get connection() {
        return this.mongo;
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
     */
    getResponse(path, method) {
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
                        result.timeoutMilleseconds = expectedResponse.timeoutMilleseconds;
                        result.responseCollectionName = expectedResponse.responseCollectionName;
                        result.body = expectedResponse.body;
                        result.projection = expectedResponse.projection;
                        result.limit = expectedResponse.limit || 0;
                        resolve(result);
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
     * Get Response with collection
     * @param {string} path 
     * @param {string} method
     * @param {Object} filter
     */
    getResponseWithCollection(path, method, filter = {}) {
        let result = {
            statusCode: 304
        };
        return new Promise((resolve, reject) => {
            this.getResponse(path, method)
            .then((response) => {
                result.statusCode = response.statusCode;
                result.timeoutMilleseconds = response.timeoutMilleseconds;
                result.body = response.body;
                result.headers = response.headers;
                const find = response.find || filter;
                if (response.responseCollectionName) {
                    this.getCollection(response.responseCollectionName, find, response.projection, response.limit)
                    .then((collection) => {
                        if (collection) {
                            if (response.limit == 0 || response.limit > 1) {
                                result.body = collection;
                            } else {
                                result.body = collection[0];
                            }
                        }
                        resolve(result);
                    });
                } else {
                    resolve(result);
                }
            })
            .catch((err) => reject(err));
        });
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
        return this.mongo.update(this.mongo.DataBaseName, this.mongo.RouteCollectionName, id, update);
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
        return this.mongo.update(this.mongo.DataBaseName, this.mongo.RouteCollectionName, id, update);
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
        return this.mongo.update(this.mongo.DataBaseName, this.mongo.RouteCollectionName, id, update);
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
        return this.mongo.update(this.mongo.DataBaseName, this.mongo.RouteCollectionName, id, update);
    }

}