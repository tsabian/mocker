import { MongoClient } from 'mongodb';

const mongoUri = 'mongodb://root:pass_123@0.0.0.0:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false';

export default class MongoConnection {
    
    getConnection() {
        return new MongoClient(mongoUri,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
    }
}