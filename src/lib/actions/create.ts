import fs from 'fs-extra';
import path from 'path';

import * as migrationsDir from '../env/migrationsDir';
import * as migrationsDb from '../env/migrationsDb';

export async function create(description: string) {
    if (!description) {
        throw new Error('Missing parameter: description');
    }
    await migrationsDir.shouldExist();
    const migrationsDirPath = await migrationsDir.resolveMigrationsDirPath();

    const source = './node_modules/dynamo-data-migrations/src/samples/migration.ts';

    const filename = `${Date.now()}-${description.split(' ').join('_')}.ts`;
    const destination = path.join(migrationsDirPath, filename);

    try {
        await migrationsDb.doesMigrationsLogDbExists();
    } catch {
        await migrationsDb.configureMigrationsLogDbSchema();
    }

    // try {
    //     await migrationsDb.addMigrationToMigrationsLogDb(filename);
    //     await fs.copyFile(source, destination);
    //     message = `Created: migrations/${filename}`;
    // } catch (error) {
    //     const e = error as Error;
    //     if (e.name === 'ResourceNotFoundException') {
    //         message = `Could not create migration.. Please run command again`;
    //     } else {
    //         throw error;
    //     }
    // }

    await fs.copyFile(source, destination);
    const message = `Created: migrations/${filename}`;
    return message;
}
