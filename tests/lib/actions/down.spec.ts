import AWS from 'aws-sdk';
import { down } from "../../../src/lib/actions/down";

import * as statusModule from '../../../src/lib/actions/status';
import * as migrationsDir from '../../../src/lib/env/migrationsDir';
import * as migrationsDb from '../../../src/lib/env/migrationsDb';

describe("down", () => {
    let migration: { down: jest.Mock }
    let statusModuleStatus: jest.SpyInstance;
    let migrationsDirLoadMigration: jest.SpyInstance;
    let migrationsDbDeleteMigrationFromMigrationsLogDb: jest.SpyInstance;

    beforeEach(() => {
        migration = {
            down: jest.fn().mockReturnValue(Promise.resolve())
        }

        statusModuleStatus = jest.spyOn(statusModule, "status").mockReturnValue(
            Promise.resolve([
                {
                    fileName: "20160609113224-first_migration.ts",
                    appliedAt: new Date().toJSON()
                },
                {
                    fileName: "20160609113225-last_migration.ts",
                    appliedAt: new Date().toJSON()
                }
            ])
        );

        migrationsDirLoadMigration = jest.spyOn(migrationsDir, "loadFilesToBeMigrated")
            .mockReturnValue(migration);
        jest.spyOn(migrationsDb, "getDdb").mockImplementation(() => {
            return new AWS.DynamoDB({ apiVersion: '2012-08-10' });
        });

        migrationsDbDeleteMigrationFromMigrationsLogDb = jest.spyOn(migrationsDb, "deleteMigrationFromMigrationsLogDb").mockReturnValue(Promise.resolve());
    });


    it("should yield empty list when nothing to downgrade", async () => {
        statusModuleStatus.mockResolvedValue(
            Promise.resolve([
                { fileName: "20160609113224-some_migration.js", appliedAt: "PENDING" }
            ])
        );
        const migrated = await down();
        expect(migrated).toEqual([]);
    });

    it("should load the last n applied migration", async () => {
        await down('default', 2);
        expect(migrationsDirLoadMigration).toBeCalledTimes(2);
        expect(migrationsDirLoadMigration).nthCalledWith(1, "20160609113225-last_migration.ts");
        expect(migrationsDirLoadMigration).nthCalledWith(2, "20160609113224-first_migration.ts");
    });

    it("should downgrade all applied migrations when passed with downShift=0", async () => {
        const items = await down('default', 0);
        expect(migrationsDirLoadMigration).toBeCalledTimes(2);
        expect(migrationsDirLoadMigration).nthCalledWith(1, "20160609113225-last_migration.ts");
        expect(migrationsDirLoadMigration).nthCalledWith(2, "20160609113224-first_migration.ts");
        expect(migration.down).toBeCalledTimes(2);
        expect(items).toEqual(["20160609113225-last_migration.ts", "20160609113224-first_migration.ts"]);
        expect(migrationsDbDeleteMigrationFromMigrationsLogDb).toBeCalledTimes(2);
    });

    it("should downgrade the last applied migration when downShift parameter is not passed", async () => {
        const items = await down();
        expect(migration.down).toBeCalled();
        expect(migrationsDirLoadMigration).toBeCalledTimes(1);
        expect(migrationsDirLoadMigration).toBeCalledWith("20160609113225-last_migration.ts");
        expect(migrationsDbDeleteMigrationFromMigrationsLogDb).toBeCalledTimes(1);
        expect(items).toEqual(["20160609113225-last_migration.ts"]);
    });

    it("should yield an error when an error occurred during the downgrade", async () => {
        migration.down.mockReturnValue(Promise.reject(new Error("Invalid syntax")));
        await expect(down()).rejects.toThrow("Could not migrate down 20160609113225-last_migration.ts: Invalid syntax");
    });

    it("should yield errors that occurred when deleting from the migrationsLogDb", async () => {
        migrationsDbDeleteMigrationFromMigrationsLogDb.mockReturnValue(
            Promise.reject(new Error("Could not delete"))
        );
        await expect(down()).rejects.toThrow("Could not update migrationsLogDb: Could not delete");
    });

});