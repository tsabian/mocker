import { MongoClient, ObjectID } from 'mongodb';
import Environment from './environment';

export default class MongoConnection {

    /**
     * Initialize new instance of MongoConnection
     * @param {Environment} environment set environment variables
     */
    constructor(environment) {
        this._dataBaseName = environment.Settings.mongo.DataBaseName;
        this.mongoUri = environment.Settings.mongo.connectionString;
        this._sessionDataBase = this.getConnection();
    }

    /**
     * Get Database name
     */
    get DataBaseName() {
        return this._dataBaseName;
    }

    /**
     * Get Route Collection name
     */
    get RouteCollectionName() {
        return 'Routes';
    }

    /**
     * Get new Connection
     * @returns {MongoClient} MongoClient
     */
    getConnection() {
        return new MongoClient(this.mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    /**
     * prepare mongodb connection
     */
    prepare() {
        this._sessionDataBase = this._sessionDataBase ?? this.getConnection();
        if (!this._sessionDataBase.isConnected()) {
            this._sessionDataBase = this.getConnection();
        }
        return this._sessionDataBase;
    }

    close() {
        this._sessionDataBase.removeAllListeners();
        this._sessionDataBase.close();
    }

    /**
     * test connection
     */
    test() {
        const conn = this.prepare();
        conn.connect()
            .then(async (client) => {
                console.log('Mongo connected');
            })
            .catch(err => {
                console.log(`Connection error: ${err}`);
            })
            .finally(() => {
                console.log('Connection close');
                conn.close();
            });
    }

    /**
     * Select data from mongodb
     * @param {string} database 
     * @param {string} collection 
     * @param {object} find 
     * @param {object} projection
     * @param {Number} limit Set the limit of collection, default is 0
     */
    select(database, collection, find = {}, projection = {}, limit = 0) {
        return new Promise((resolve, reject) => {
            const conn = this.prepare();
            conn.connect()
                .then(async (client) => {
                    try {
                        const db = client.db(database);
                        const result = await db.collection(collection)
                            .find(find, { limit: limit })
                            .project(projection)
                            .toArray();
                        resolve(result);
                    } catch (err) {
                        reject(err);
                    }
                })
                .catch(err => reject(err));
        });
    }

    /**
     * Insert many itens on collection and return inserted ids [keys: numbers]
     * @param {string} database set data base name
     * @param {string} collection set collection name
     * @param {object} data document data
     */
    insertMany(database, collection, data) {
        return new Promise((resolve, reject) => {
            const conn = this.prepare();
            conn.connect()
                .then(async (client) => {
                    try {
                        const db = client.db(database);
                        db.collection(collection)
                            .insertMany(data, (err, result) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(result.insertedIds);
                                }
                            });
                    } catch (err) {
                        reject(err);
                    }
                })
                .catch(err => reject(err));
        });
    }

    /**
     * Update a object
     * @param {string} database set data base name
     * @param {string} collection set collection name
     * @param {string} id Set collection id
     * @param {Object} updateQuery Set update query json object
     * @returns Promise
     */
    update(database, collection, id, updateQuery) {
        let _id = ObjectID(id);
        return new Promise((resolve, reject) => {
            const conn = this.prepare();
            conn.connect()
                .then(async (client) => {
                    const query = {
                        _id
                    };
                    try {
                        const db = client.db(database);
                        db.collection(collection)
                            .updateOne(query, updateQuery, (err, result) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(result);
                                }
                            });
                    } catch (error) {
                        reject(error);
                    }
                })
                .catch((err) => reject(err));
        });
    }
}