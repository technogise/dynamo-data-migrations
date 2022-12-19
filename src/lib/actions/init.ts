import fs from 'fs-extra';
import path from 'path';

import * as migrationsDir from '../env/migrationsDir';
import * as config from '../env/config';

function copySampleConfigFile() {
    const source = './node_modules/dynamo-data-migrations/src/samples/config.ts';
    const destination = path.join(process.cwd(), `setup.db/${config.DEFAULT_CONFIG_FILE_NAME}`);
    return fs.copy(source, destination);
}

function createMigrationsDirectory() {
    return fs.mkdirs(path.join(process.cwd(), `setup.db/${migrationsDir.DEFAULT_MIGRATIONS_DIR_NAME}`));
}

export async function init() {
    await migrationsDir.shouldNotExist();
    await config.shouldNotExist();

    await copySampleConfigFile();
    return createMigrationsDirectory();
}
