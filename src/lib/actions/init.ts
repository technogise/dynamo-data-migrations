import fs from 'fs-extra';

export default class init {
    constructor() {
        this.copyFile('./node_modules/dynamo-data-migrations/src/samples', './setup.db');
    }
    copyFile = function (src: string, dest: string) {
        try {
            fs.copySync(src, dest);
            console.log('Initialization successful. Please edit the generated config.js file');
        } catch (err) {
            console.error(err);
        }
    };
}
