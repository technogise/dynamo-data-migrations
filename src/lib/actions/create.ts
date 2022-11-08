import fs from 'fs-extra';

export function create(description: string) {
    let isFile = false;
    try {
        const stats = fs.statSync('./setup.db/config.ts');
        isFile = stats.isFile();
    } catch {
        console.info('No config.ts file found, Please run the init command first');
    }
    if (isFile) {
        try {
            if (!fs.existsSync('setup.db/migrations')) {
                fs.mkdirSync('setup.db/migrations');
            }
            const filePath = `setup.db/migrations/${Date.now()}${
                description === undefined ? '' : `_${description}`
            }.ts`;
            fs.createFile(filePath, (error) => {
                if (error) throw error;

                fs.copyFileSync('./node_modules/dynamo-data-migrations/src/samples/migration.ts', filePath);

                console.info('File is created successfully.');
            });
        } catch (error) {
            console.error(error);
        }
    }
}
