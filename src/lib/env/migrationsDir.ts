import fs from 'fs-extra';
import path from 'path';
import url from 'url';
import * as moduleLoader from '../utils/moduleLoader';

export const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';

export function resolveMigrationsDirPath() {
    return path.join(process.cwd(), `setup.db/${DEFAULT_MIGRATIONS_DIR_NAME}`);
}

export function isMigrationDirPresent() {
    return fs.existsSync(resolveMigrationsDirPath());
}

export function getFileNamesInMigrationFolder() {
    const migrationsDir = resolveMigrationsDirPath();
    const files = fs.readdirSync(migrationsDir);
    return files.sort();
}

export function loadFilesToBeMigrated(fileName: string) {
    const migrationsDir = resolveMigrationsDirPath();
    const migrationPath = path.join(migrationsDir, fileName);
    return moduleLoader.importFile(url.pathToFileURL(migrationPath).pathname);
}
