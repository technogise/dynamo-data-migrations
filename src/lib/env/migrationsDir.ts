import fs from 'fs-extra';
import path from 'path';
import * as config from './config';

export const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
type ERROR = { errno: number; syscall: string; code: string; path: string };

export async function resolveMigrationsDirPath() {
    let migrationsDir;
    try {
        const configContent = await config.read();
        // migrationsDir = configContent.migrationsDir;
        migrationsDir = null;
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
    return path.join(process.cwd(), `setup.db/${migrationsDir}`);
}

async function resolveSampleMigrationFileName() {
    return 'migration.ts';
}

export async function resolveSampleMigrationPath() {
    const migrationsDir = await resolveMigrationsDirPath();
    const sampleMigrationSampleFileName = await resolveSampleMigrationFileName();
    return path.join(migrationsDir, sampleMigrationSampleFileName);
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

export async function shouldExist() {
    const migrationsDir = await resolveMigrationsDirPath();
    try {
        await fs.stat(migrationsDir);
    } catch {
        throw new Error(`migrations directory does not exist: ${migrationsDir}`);
    }
}

export async function doesSampleMigrationExist() {
    const samplePath = await resolveSampleMigrationPath();
    try {
        await fs.stat(samplePath);
        return true;
    } catch {
        return false;
    }
}
