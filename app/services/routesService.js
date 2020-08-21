import MongoConnection from '../../config/mongo';

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
     * @param {MongoConnection} mongo 
     */
    constructor(mongo = new MongoConnection()) {
        this.mongo = mongo;
    }

    getAllRoutes() {
        return this.mongo.select(this.mongo.DataBaseName, this.mongo.RouteCollectionName);
    }

    /**
     * Get Routes by methods
     * @param {Methods} withMethod Set method filter
     */
    getRoutes(withMethod = Methods) {
        const projection = {
            'route': 1, 
            '_id': 0, 
            'method': 1
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
    getResponse(route, method) {
        const find = {
            'route': `${route}`,
            'method': `${method}`
        };
        const projection = {
            '_id': 0
        };
        return this.mongo.select(this.mongo.DataBaseName, this.mongo.RouteCollectionName, find, projection);
    }

    /**
     * 
     * @param {string} collectionName Set collection name
     * @param {string} find Set filter
     */
    getCollection(collectionName, find, projection) {
        return this.mongo.select(this.mongo.DataBaseName, collectionName, find, projection);
    }

}