import fs from 'fs-extra';
import path from 'path';
import { getFileLoader } from '../env/config';
import { isMigrationDirPresent, resolveMigrationsDirPath } from '../env/migrationsDir';

export async function create(description: string) {
    if (!description) {
        throw new Error('Please pass a valid description');
    }
    if (!isMigrationDirPresent()) {
        throw new Error('Please ensure migrations directory as specified in config.json is present');
    }
    const migrationsDirPath = resolveMigrationsDirPath();
    const fileLoader = getFileLoader();
    const filename = `${Date.now()}-${description.split(' ').join('_')}${fileLoader.configExtension}`;
    const destination = path.join(migrationsDirPath, filename);
    await fs.copyFile(fileLoader.migrationTemplate, destination);
    return filename;
}
