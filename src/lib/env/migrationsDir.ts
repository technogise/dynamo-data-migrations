import fs from 'fs-extra';
import path from 'path';
import * as config from './config';

export const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
type ERROR = { errno: number; syscall: string; code: string; path: string };

async function resolveMigrationsDirPath() {
    let migrationsDir;
    try {
        const configContent = await config.read();
        migrationsDir = configContent.migrationsDir;
        // if config file doesn't have migrationsDir key, assume default 'migrations' dir
        if (!migrationsDir) {
            migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
        }
    } catch {
        // config file could not be read, assume default 'migrations' dir
        migrationsDir = DEFAULT_MIGRATIONS_DIR_NAME;
    }

    if (path.isAbsolute(migrationsDir)) {
        return migrationsDir;
    }
    return path.join(process.cwd(), migrationsDir);
}

export async function shouldNotExist() {
    const migrationsDir = await resolveMigrationsDirPath();
    const error = new Error(`migrations directory already exists: ${migrationsDir}`);

    try {
        await fs.stat(migrationsDir);
        throw error;
    } catch (error_) {
        const e = error_ as ERROR;
        if (e.code !== 'ENOENT') {
            throw error;
        }
    }
}
