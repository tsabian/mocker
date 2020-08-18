import fs from 'fs';
import path from 'path';
import MongoConnection from '../../config/mongo';

export default class MockerService {
    
    /**
     * Get dbName
     */
    get dbName() {
        return 'mocker';
    }

    /**
     * Initialize new instance of MockerService
     * @param {MongoConnection} mongo MongoConnection instance injection
     */
    constructor(mongo = new MongoConnection()) {
        this.mongo = mongo;
        this.routesCollectionName = 'routes';
        this.routeIndexName = 'route';
    }

    /**
     * Initialize all collections of data base
     */
    initializeRoutes() {
        const sampleFilename = 'routeDataSample.json';
        const filePath = path.join('./', sampleFilename);
        fs.exists(filePath, async (exists) => {
            if (!exists) {
                console.log(`File ${filePath} not found`);
                return;
            }
            fs.readFile(filePath, (err, data) => { 
                if (err) {
                    console.log(err.message);
                } else {
                    const collection = JSON.parse(data);
                    this.mongo.insertMany(this.dbName,
                                          this.routesCollectionName, collection)
                    .then((results) => { 
                        if (!results) {
                            console.log('Error on insert collection items');
                        } else {
                            console.log(results);
                        }
                    })
                    .catch(err => { 
                        console.log(err);
                    });
                }
            });
        });
        
    }

    createCollections() {
        const conn = this.mongo.prepare();
        conn.connect()
        .then(async (client) => { 
            const db = client.db(this.dbName);
            const collection = db.collection(this.routesCollectionName, (err, result) => {
                if (err) {
                    console.log(err.message);
                } else {
                    db.createCollection(this.routesCollectionName, (err, result) => { 
                        if (err) {
                            console.log(err);
                        } else {
                            db.createIndex(this.routeIndexName, 'route', { 
                                unique: true 
                            });
                            this.initializeRoutes();
                        }
                        client.close();
                    });
                }
            });
        })
        .catch(err => console.log(err))
        .finally(() => conn.close());
    }
}
