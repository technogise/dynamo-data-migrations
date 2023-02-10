import fs from 'fs-extra';
import path from 'path';
import { getFileLoader } from '../env/config';
import { isMigrationDirPresent, resolveMigrationsDirPath } from '../env/migrationsDir';

export async function create(description: string) {
    if (!description || !isMigrationDirPresent()) {
        throw new Error(
            'Please ensure description is passed to create method and/or init method is executed once to initialize migration setup',
        );
    }
    const migrationsDirPath = resolveMigrationsDirPath();
    const fileLoader = getFileLoader();
    const filename = `${Date.now()}-${description.split(' ').join('_')}${fileLoader.configExtension}`;
    const destination = path.join(migrationsDirPath, filename);
    await fs.copyFile(fileLoader.migrationTemplate, destination);
    return filename;
}
