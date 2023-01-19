import fs from 'fs-extra';
import path from 'path';

import * as migrationsDir from '../env/migrationsDir';
import * as config from '../env/config';

const source = './node_modules/dynamo-data-migrations/src/samples/config.ts';
const destination = path.join(process.cwd(), `setup.db/${config.DEFAULT_CONFIG_FILE_NAME}`);

export async function init() {
    if (!migrationsDir.isMigrationDirPresent() && !config.isConfigFilePresent()) {
        fs.copySync(source, destination);
        return fs.mkdirs(path.join(process.cwd(), `setup.db/${migrationsDir.DEFAULT_MIGRATIONS_DIR_NAME}`));
    }
    throw new Error('Migrations Dir already exist. Init step not required ');
}
