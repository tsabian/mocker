import MongoConnection from '../../config/mongo';

export class Methods { }
Methods.get = 'get';
Methods.post = 'post';
Methods.put = 'put';
Methods.delete = 'delete';

export default class RouteService {
    
    get dbName() {
        return 'mocker';
    }

    /**
     * Inicialize new instance of RouteService
     * @param {MongoConnection} mongo 
     */
    constructor(mongo = new MongoConnection()) {
        this.mongo = mongo;
        this.collectionName = 'routes';
    }

    getAllRoutes() {
        return this.mongo.select(this.dbName, this.collectionName)
    }

    /**
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
        }
        return this.mongo.select(this.dbName, this.collectionName, find, projection);
    }

    /**
     * 
     * @param {string} route 
     * @param {string} method 
     */
    setResponse(route, method) {
        const find = {
            'route': `${route}`,
            'method': `${method}`
        }
        const projection = {
            '_id': 0
        }
        return this.mongo
        .select(this.mongo.dbName, this.collectionName, find, projection);
    }

}