import { find } from 'lodash';

import * as migrationsDir from '../env/migrationsDir';
import * as migrationsDb from '../env/migrationsDb';
import * as config from '../env/config';

export async function status(profile = 'default') {
    await migrationsDir.shouldExist();
    await config.shouldExist();
    const fileNames = await migrationsDir.getFileNames();

    const migrationsLog = await migrationsDb.getAllMigrations();

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
