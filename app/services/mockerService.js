import fs from 'fs';
import path from 'path';
import MongoConnection from '../../config/mongo';

export default class MockerService {
    
    /**
     * Initialize new instance of MockerService
     * @param {MongoConnection} mongo MongoConnection instance injection
     */
    constructor(mongo = new MongoConnection()) {
        this.mongo = mongo;
    }

    /**
     * Initialize all collections of data base
     * @returns {Promise} Return the promise object represents the result and error
     */
    initializeCollections() {

        const successfullyMessage = 'Collections has initialized successfully';
        const sampleDataIsInvalid = 'SampleData not found, empty or is invalid';
        const getRouteCollectionFail = 'Error on insert collection items';
        const routeFileName = 'routesDataSample.json';
        const valueFileName = 'valuesDataSample.json';
        const routeFilePath = path.join('./', 'DataSample', routeFileName);
        const valueFilePath = path.join('./', 'DataSample', valueFileName);

        return new Promise((resolve, reject) => { 
            this.mongo.select(this.mongo.DataBaseName, this.mongo.RouteCollectionName)
            .then((current) => {
                if (current.length == 0) {
                    
                    const routeCollection = this.getSampleDataSync(routeFilePath);

                    if (!routeCollection) {
                        reject(sampleDataIsInvalid);
                    } else {

                        this.mongo.insertMany(this.mongo.DataBaseName, this.mongo.RouteCollectionName, routeCollection)
                        .then((results) => { 
                            if (!results) {
                                reject(getRouteCollectionFail);
                            } else {
                                const result = { 
                                    ids: results, 
                                    success: true,
                                    reason: successfullyMessage
                                };
                                const valuesCollection = this.getSampleDataSync(valueFilePath);
                                if (valuesCollection) {
                                    this.mongo.insertMany(this.mongo.DataBaseName, 'Values', valuesCollection)
                                    .then(() => {
                                        console.log(`Values added`);
                                    })
                                    .catch(err => console.log(err));
                                }
                                resolve(result);
                            }
                        })
                        .catch(err => { 
                            reject(err);
                        });
                    }
                } else {
                    const result = { 
                        success: true,
                        reason: successfullyMessage
                    };
                    resolve(result);
                }
            })
            .catch(err => {
                reject(err);
            });
        });
    }

    /**
     * Get sample data from file data
     * @param {string} filePath set the file path
     * @returns {Buffer}
     */
    getSampleDataSync(filePath) {
        let buffer = Buffer.alloc(0, null);
        const exists = fs.existsSync(filePath);
        if (!exists) {
            console.log(`File ${filePath} not found`);
            return buffer;
        }
        try {
            buffer = fs.readFileSync(filePath);    
            const sampleCollection = JSON.parse(buffer);
            return sampleCollection;
        } catch (err) {
            console.log(err);
            return buffer;
        }
    }
}