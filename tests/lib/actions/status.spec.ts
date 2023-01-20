import AWS from "aws-sdk";
import { status } from "../../../src/lib/actions/status";

import * as migrationsDir from '../../../src/lib/env/migrationsDir';
import * as config from '../../../src/lib/env/config';
import * as migrationsDb from '../../../src/lib/env/migrationsDb';

describe("status", () => {
    let migrationsDirShouldExist: jest.SpyInstance;
    let configShouldExist: jest.SpyInstance;
    let migrationsDirGetFileNames: jest.SpyInstance;
    let migrationsDbGetAllMigrations: jest.SpyInstance;

    beforeEach(() => {
        migrationsDirShouldExist = jest.spyOn(migrationsDir, "isMigrationDirPresent").mockReturnValue(true);
        configShouldExist = jest.spyOn(config, "isConfigFilePresent").mockReturnValue(true);
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
        jest.spyOn(migrationsDb, "getDdb").mockImplementation(() => {
            return new AWS.DynamoDB({ apiVersion: '2012-08-10' });
        })
    }
    );


    it("should check that the migrations directory and config exists", async () => {
        await status();
        expect(migrationsDirShouldExist).toBeCalled();
        expect(configShouldExist).toBeCalled();
    });

    it("should yield an error when the migrations directory does not exist", async () => {
        migrationsDirShouldExist.mockReturnValue(false);
        await expect(status()).rejects.toThrow("Please ensure migrations directory and config file is present. If not run init to initialize the same");
    });


    it("should yield an error when confile does not exist", async () => {
        configShouldExist.mockReturnValue(false);
        await expect(status()).rejects.toThrow("Please ensure migrations directory and config file is present. If not run init to initialize the same");
    });

    it("should get the list of files in the migrations directory", async () => {
        await status();
        expect(migrationsDirGetFileNames).toBeCalled();
    });

    it("should yield errors that occurred when getting the list of files in the migrations directory", async () => {
        migrationsDirGetFileNames.mockImplementation(() => { throw new Error("File system unavailable") });
        await expect(status()).rejects.toThrow("File system unavailable");
    });

    it("should fetch the content of the migrationsLogDb collection", async () => {
        await status();
        expect(migrationsDbGetAllMigrations).toBeCalled();
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