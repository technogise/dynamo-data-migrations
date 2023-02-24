import { find } from 'lodash';

import * as migrationsDir from '../env/migrationsDir';
import * as migrationsDb from '../env/migrationsDb';

export async function status(profile = 'default') {
    const ddb = await migrationsDb.getDdb(profile);
    const fileNamesInMigrationFolder = migrationsDir.getFileNamesInMigrationFolder();

    const migrationsLog = await migrationsDb.getAllMigrations(ddb);

    const statusTable = await Promise.all(
        fileNamesInMigrationFolder.map(async (fileName) => {
            const fileNameToSearchInMigrationsLog = { FILE_NAME: fileName };
            const fileMigrated: any = find(migrationsLog, fileNameToSearchInMigrationsLog);
            const appliedAt = fileMigrated ? fileMigrated.APPLIED_AT : 'PENDING';
            return { fileName, appliedAt };
        }),
    );

    return statusTable;
}
