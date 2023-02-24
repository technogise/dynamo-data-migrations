import fs from 'fs-extra';
import path from 'path';
import * as migrationsDir from '../env/migrationsDir';
import * as config from '../env/config';

export async function init(type = 'ts') {
    if (!config.isConfigFilePresent()) {
        config.initializeConfig(type);
        return fs.mkdirs(path.join(process.cwd(), migrationsDir.DEFAULT_MIGRATIONS_DIR_NAME));
    }
    throw new Error('Config file already exist, init step not required');
}
