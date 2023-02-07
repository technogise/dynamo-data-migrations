import { find } from 'lodash';

import * as migrationsDir from '../env/migrationsDir';
import * as migrationsDb from '../env/migrationsDb';
import * as config from '../env/config';

export async function status(profile = 'default') {
    if (migrationsDir.isMigrationDirPresent() && config.isConfigFilePresent()) {
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

    throw new Error(
        'Please ensure migrations directory and config file is present. If not run init to initialize the same',
    );
}
