import fs from 'fs-extra';

export class Init {
    init() {
        this.copyFile('./node_modules/dynamo-data-migrations/src/samples', './migrations');
    }

    copyFile(src: string, dest: string) {
        try {
            fs.copySync(src, dest);
            console.info('Initialization successful. Please edit the generated config.js file');
        } catch (error) {
            console.error(error);
        }
    }
}
