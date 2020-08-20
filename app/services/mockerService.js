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
    initializeCollections() {
        const successfullyMessage = 'Collections has initialized successfully';
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
                    const sampleCollection = JSON.parse(data);
                    this.mongo.select(this.dbName, this.routesCollectionName)
                    .then((current) => {
                        if (current.length == 0) {
                            console.log('Initialize collections');
                            this.mongo.insertMany(this.dbName, this.routesCollectionName, sampleCollection)
                            .then((results) => { 
                                if (!results) {
                                    console.log('Error on insert collection items');
                                } else {
                                    console.log(results);
                                    console.log(successfullyMessage);
                                }
                            })
                            .catch(err => { 
                                console.log(err);
                            });
                        } else {
                            console.log(successfullyMessage);
                        }
                    })
                    .catch(err => console.log(err));
                }
            });
        });   
    }
}