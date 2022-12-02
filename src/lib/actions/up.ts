import _ from 'lodash';
import pEachSeries from 'p-each-series';

import * as migrationsDir from '../env/migrationsDir';
import * as migrationsDb from '../env/migrationsDb';
import { status } from './status';

class ERROR extends Error {
    migrated?: string[];
}

export async function up() {
    const statusItems = await status();
    const pendingItems = _.filter(statusItems, { appliedAt: 'PENDING' });
    const migrated: string[] = [];

    const migrateItem = async (item: { fileName: string; appliedAt: string }) => {
        try {
            const migration = await migrationsDir.loadMigration(item.fileName);
            const migrationUp = migration.up;
            await migrationUp();
        } catch (error_) {
            const e = error_ as Error;
            const error = new ERROR(`Could not migrate up ${item.fileName}: ${e.message}`);
            error.stack = e.stack;
            error.migrated = migrated;
            throw error;
        }

        const migration = {
            fileName: item.fileName,
            appliedAt: new Date().toString(),
        };

        try {
            await migrationsDb.addMigrationToMigrationsLogDb(migration);
        } catch (error) {
            const e = error as Error;
            throw new Error(`Could not update migrationsLogDb: ${e.message}`);
        }
        migrated.push(item.fileName);
    };

    await pEachSeries(pendingItems, migrateItem);
    return migrated;
}
