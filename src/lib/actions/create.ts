import fs from 'fs-extra';
import path from 'path';

import * as migrationsDir from '../env/migrationsDir';
import * as migrationsDb from '../env/migrationsDb';

const source = path.join(__dirname, `../../migration.template`);

export async function create(description: string, profile = 'default') {
    if (!description) {
        throw new Error('Missing parameter: description');
    }
    if (migrationsDir.isMigrationDirPresent()) {
        const ddb = migrationsDb.getDdb(profile);
        const migrationsDirPath = migrationsDir.resolveMigrationsDirPath();
        const filename = `${Date.now()}-${description.split(' ').join('_')}.ts`;
        const destination = path.join(migrationsDirPath, filename);
        try {
            await migrationsDb.doesMigrationsLogDbExists(ddb);
        } catch {
            await migrationsDb.configureMigrationsLogDbSchema(ddb);
        }
        await fs.copyFile(source, destination);
        return filename;
    }
    throw new Error('Migration directory not present. Ensure init command is executed.');
}
