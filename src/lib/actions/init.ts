import fs from 'fs-extra';
import path from 'path';
import * as migrationsDir from '../env/migrationsDir';
import * as config from '../env/config';

export async function init(type = 'ts') {
    if (!migrationsDir.isMigrationDirPresent() && !config.isConfigFilePresent()) {
        config.initializeConfig(type);
        return fs.mkdirs(path.join(process.cwd(), `setup.db/${migrationsDir.DEFAULT_MIGRATIONS_DIR_NAME}`));
    }
    throw new Error('Migrations Dir already exist. Init step not required ');
}
