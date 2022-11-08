import fs from 'fs-extra';

export function copySampleConfigFile() {
    try {
        fs.copySync('./node_modules/dynamo-data-migrations/src/samples/config.ts', './setup.db/config.ts');
    } catch (error) {
        console.error(error);
    }
}

export function createMigrationsDirectory() {
    try {
        fs.mkdir('setup.db/migrations');
    } catch (error) {
        console.error(error);
    }
}

// module.exports = () => {
//     copySampleConfigFile();
//     return createMigrationsDirectory();
// };
