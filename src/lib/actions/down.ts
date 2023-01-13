import _ from 'lodash';

import { status } from './status';
import * as migrationsDir from '../env/migrationsDir';
import * as migrationsDb from '../env/migrationsDb';

export async function down(profile = 'default') {
    const downgraded = [];
    const statusItems = await status(profile);
    const appliedItems = statusItems.filter((item) => item.appliedAt !== 'PENDING');
    const lastAppliedItem = _.last(appliedItems);

    if (lastAppliedItem) {
        try {
            const migration = await migrationsDir.loadMigration(lastAppliedItem.fileName);
            const migrationDown = migration.down;
            const ddb = await migrationsDb.getDdb(profile);
            await migrationDown(ddb);
        } catch (error) {
            const e = error as Error;
            throw new Error(`Could not migrate down ${lastAppliedItem.fileName}: ${e.message}`);
        }

        try {
            await migrationsDb.deleteMigrationFromMigrationsLogDb(lastAppliedItem);
            downgraded.push(lastAppliedItem.fileName);
        } catch (error) {
            const e = error as Error;
            throw new Error(`Could not update migrationsLogDb: ${e.message}`);
        }
    }

    return downgraded;
}
