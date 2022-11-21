import fs from 'fs-extra';
import path from 'path';

import * as migrationsDir from '../env/migrationsDir';
import * as config from '../env/config';

// export function create(description: string) {
//     let isFile = false;
//     try {
//         const stats = fs.statSync('./setup.db/config.ts');
//         isFile = stats.isFile();
//     } catch {
//         console.info('No config.ts file found, Please run the init command first');
//     }
//     if (isFile) {
//         try {
//             if (!fs.existsSync('setup.db/migrations')) {
//                 fs.mkdirSync('setup.db/migrations');
//             }
//             const filePath = `setup.db/migrations/${Date.now()}${
//                 description === undefined ? '' : `_${description}`
//             }.ts`;
//             fs.createFile(filePath, (error) => {
//                 if (error) throw error;

//                 fs.copyFileSync('./node_modules/dynamo-data-migrations/src/samples/migration.ts', filePath);

//                 console.info('File is created successfully.');
//             });
//         } catch (error) {
//             console.error(error);
//         }
//     }
// }

export async function create(description: string) {
    if (!description) {
        throw new Error('Missing parameter: description');
    }
    await migrationsDir.shouldExist();
    const migrationsDirPath = await migrationsDir.resolveMigrationsDirPath();

    // Check if there is a 'sample-migration.js' file in migrations dir - if there is, use that

    const source = (await migrationsDir.doesSampleMigrationExist())
        ? await migrationsDir.resolveSampleMigrationPath()
        : './node_modules/dynamo-data-migrations/src/samples/migration.ts';

    const filename = `${Date.now()}-${description.split(' ').join('_')}.ts`;
    const destination = path.join(migrationsDirPath, filename);
    await fs.copy(source, destination);
    return filename;
}
