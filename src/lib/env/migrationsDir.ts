import fs from 'fs-extra';
import path from 'path';
import { getFileLoader, loadMigrationsDir } from './config';

export const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';

export function resolveMigrationsDirPath() {
    if (path.isAbsolute(loadMigrationsDir())) {
        return loadMigrationsDir();
    }
    return path.join(process.cwd(), loadMigrationsDir());
}

export function isMigrationDirPresent() {
    return fs.existsSync(resolveMigrationsDirPath());
}

export function getFileNamesInMigrationFolder() {
    const migrationsDir = resolveMigrationsDirPath();
    if (isMigrationDirPresent()) {
        const files = fs.readdirSync(migrationsDir);
        return files.sort();
    }
    throw new Error('Please ensure migrations directory as specified in config.json is present');
}

export async function loadFilesToBeMigrated(fileName: string) {
    if (isMigrationDirPresent()) {
        const migrationsDir = resolveMigrationsDirPath();
        return getFileLoader().loadMigrationFile(path.join(migrationsDir, fileName));
    }
    throw new Error('Please ensure migrations directory as specified in config.json is present');
}
