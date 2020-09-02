import fs from 'fs';
import path from 'path';
import { param } from 'express-validator';

export default class Environment {

    /**
     * Initialize new instance of Environment
     * @param {string} environment Set environment name
     */
    constructor(environment = null) {
        const paramName = '--configuration';
        this.environmentVariables = this.toDictionary(process.argv.slice(2));
        this.environmentName = environment || this.environmentVariables[paramName];
        this.environment = null;
    }

    /**
     * Convert array to dictionary
     * @param {Array} array Set the array
     * @returns return the dictionary
     */
    toDictionary(args) {
        const dictionary = args.map((value) => { 
            const current = value.split('='); 
            return { 
                key: current[0],
                value: current[1]
            };
        }).reduce((dict, item) => (dict[item.key] = item.value, dict), {});
        return dictionary
    }

    /**
     * Get Environment settings
     */
    get Settings() {
        if (this.environment) {
            return this.environment;
        }
        this.environment = this.prepareSettings()
        return this.environment;
    }

    /**
     * Prepare enviromnent data
     */
    prepareSettings() {
        const fileName = this.environmentName ? `.${this.environmentName}.json` : `.json`;
        const filePath = path.join('./', 'app', 'environment', `env${fileName}`);
        const exists = fs.existsSync(filePath);
        if (!exists) {
            console.log(`Environment file not found ${filePath}`);
            return null;
        }
        const buffer = fs.readFileSync(filePath);
        const environment = JSON.parse(buffer);
        return environment;
    }
}