import fs from 'fs-extra';
import path from 'path';
import * as config from './config';

export const DEFAULT_MIGRATIONS_DIR_NAME = 'migrations';
type ERROR = { errno: number; syscall: string; code: string; path: string };

export async function resolveMigrationsDirPath() {
    return path.join(process.cwd(), `setup.db/${DEFAULT_MIGRATIONS_DIR_NAME}`);
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
