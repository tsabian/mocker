import { MongoClient, ObjectID } from 'mongodb';
import Environment from './environment';

export default class MongoConnection {

    /**
     * Initialize new instance of MongoConnection
     * @param {string} connectionString set connection string to mongodb
     */
    constructor(connectionString) {
        this.mongoUri = connectionString;
    }

    /**
     * Get Database name
     */
    get DataBaseName() {
        return 'Mocker';
    }

    /**
     * Get Route Collection name
     */
    get RouteCollectionName() {
        return 'Routes';
    }

    /**
     * prepare mongodb connection
     */
    prepare() {
        return new MongoClient(this.mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
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
     */
    select(database, collection, find = {}, projection = {}) {
        const mongoProperties = {
            find,
            projection
        };
        return new Promise((resolve, reject) => {
            const conn = this.prepare();
            conn.connect()
                .then(async (client) => {
                    try {
                        const db = client.db(database);
                        const result = await db.collection(collection)
                            .find(find)
                            .project(projection)
                            .toArray();
                        resolve(result);
                    } catch (err) {
                        reject(err);
                    } finally {
                        client.close();
                    }
                })
                .catch(err => reject(err))
                .finally(() => conn.close());
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
                                client.close();
                            });
                    } catch (err) {
                        reject(err);
                    }
                })
                .catch(err => reject(err))
                .finally(() => conn.close());
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
                                client.close();
                            });
                    } catch (error) {
                        reject(error);
                    }
                })
                .catch((err) => reject(err))
                .finally(() => conn.close());
        });
    }
}