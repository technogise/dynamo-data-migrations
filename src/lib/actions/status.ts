import { find } from 'lodash';

import * as migrationsDir from '../env/migrationsDir';
import * as migrationsDb from '../env/migrationsDb';
import * as config from '../env/config';

export async function status(profile = 'default') {
    if (migrationsDir.isMigrationDirPresent() && config.isConfigFilePresent()) {
        const ddb = migrationsDb.getDdb(profile);
        const fileNames = migrationsDir.getFileNamesToBeMigrated();

        const migrationsLog = await migrationsDb.getAllMigrations(ddb);

        const statusTable = await Promise.all(
            fileNames.map(async (fileName) => {
                const findTest = { FILE_NAME: fileName };
                const itemInLog: any = find(migrationsLog, findTest);
                const appliedAt = itemInLog ? itemInLog.APPLIED_AT : 'PENDING';
                return { fileName, appliedAt };
            }),
        );

        return statusTable;
    }

    throw new Error(
        'Please ensure migrations directory and config file is present. If not run init to initialize the same',
    );
}
