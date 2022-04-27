import fs from 'fs-extra';

export function init() {
    try {
        fs.copySync('./node_modules/dynamo-data-migrations/src/samples', './setup.db');
        console.log('Initialization successful. Please edit the generated config.js file');
    } catch (err) {
        console.error(err);
    }
}
