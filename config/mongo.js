import { MongoClient } from 'mongodb';
import { resolveInclude } from 'ejs';

const mongoUri = 'mongodb://root:pass_123@0.0.0.0:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false';

export default class MongoConnection {
    
    /**
     * prepare mongodb connection
     */
    prepare() {
        return new MongoClient(mongoUri,
            {
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
            console.log('connected')
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
            .finally(() => conn.close())
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
                            }
                            else {
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
}