import AWS from "aws-sdk";
import { status } from "../../../src/lib/actions/status";

import * as migrationsDir from '../../../src/lib/env/migrationsDir';
import * as config from '../../../src/lib/env/config';
import * as migrationsDb from '../../../src/lib/env/migrationsDb';

describe("status", () => {
    let migrationsDirGetFileNames: jest.SpyInstance;
    let migrationsDbGetAllMigrations: jest.SpyInstance;

    beforeEach(() => {
        migrationsDirGetFileNames = jest.spyOn(migrationsDir, "getFileNamesInMigrationFolder").mockReturnValue([
            "20160509113224-first_migration.ts",
            "20160512091701-second_migration.ts",
            "20160513155321-third_migration.ts"
        ]);
        migrationsDbGetAllMigrations = jest.spyOn(migrationsDb, "getAllMigrations").mockResolvedValue([
            {
                FILE_NAME: "20160509113224-first_migration.ts",
                APPLIED_AT: new Date("2016-06-03T20:10:12.123Z").toJSON()
            },
            {
                FILE_NAME: "20160512091701-second_migration.ts",
                APPLIED_AT: new Date("2016-06-09T20:10:12.123Z").toJSON()
            }
        ]);
        jest.spyOn(migrationsDb, "getDdb").mockResolvedValue(new AWS.DynamoDB({ apiVersion: '2012-08-10' }));
    }
    );


    it("should yield an error when the migrations directory does not exist", async () => {
        migrationsDirGetFileNames.mockRestore();
        jest.spyOn(config,"loadMigrationsDir").mockReturnValue("/migrations");
        await expect(status()).rejects.toThrow("Please ensure migrations directory as specified in config.json is present");
    });


    it("should yield errors that occurred when getting the list of files in the migrations directory", async () => {
        migrationsDirGetFileNames.mockImplementation(() => { throw new Error("File system unavailable") });
        await expect(status()).rejects.toThrow("File system unavailable");
    });


    it("should yield errors that occurred when fetching the migrationsLogDb collection", async () => {
        migrationsDbGetAllMigrations.mockImplementation(() => { throw new Error("Cannot read from the database") });
        await expect(status()).rejects.toThrow("Cannot read from the database");
    });

    it("should yield an array that indicates the status of the migrations in the directory", async () => {
        const statusItems = await status();
        expect(statusItems).toEqual([
            {
                appliedAt: "2016-06-03T20:10:12.123Z",
                fileName: "20160509113224-first_migration.ts"
            },
            {
                appliedAt: "2016-06-09T20:10:12.123Z",
                fileName: "20160512091701-second_migration.ts"
            },
            {
                appliedAt: "PENDING",
                fileName: "20160513155321-third_migration.ts"
            }
        ]);
    });
})