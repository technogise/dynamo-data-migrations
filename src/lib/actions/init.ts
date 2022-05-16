import fs from 'fs-extra';

export function init() {
    try {
        fs.copySync('./node_modules/dynamo-data-migrations/src/samples', './setup.db');
        console.info('Initialization successful. Please edit the generated config.ts file');
    } catch (error) {
        console.error(error);
    }
}
