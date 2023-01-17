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
    let migrationsDbGetDdb: jest.SpyInstance;

    beforeEach(() => {
        migrationsDirShouldExist = jest.spyOn(migrationsDir, "shouldExist").mockReturnValue(Promise.resolve());
        configShouldExist = jest.spyOn(config, "shouldExist").mockReturnValue(Promise.resolve());
        migrationsDirGetFileNames = jest.spyOn(migrationsDir, "getFileNames").mockResolvedValue([
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
        migrationsDbGetDdb = jest.spyOn(migrationsDb, "getDdb").mockImplementation(() => {
            return Promise.resolve(new AWS.DynamoDB({ apiVersion: '2012-08-10' }));
        })
    }
    );

    afterEach(() => {
        migrationsDirShouldExist.mockRestore();
        configShouldExist.mockRestore();
        migrationsDirGetFileNames.mockRestore();
        migrationsDbGetAllMigrations.mockRestore();
    });

    it("should check that the migrations directory exists", async () => {
        await status();
        expect(migrationsDirShouldExist).toBeCalled();
    });

    it("should yield an error when the migrations directory does not exist", async () => {
        migrationsDirShouldExist.mockReturnValue(Promise.reject(new Error("migrations directory does not exist")));
        await expect(status()).rejects.toThrow("migrations directory does not exist");
    });

    it("should check that the config file exists", async () => {
        await status();
        expect(configShouldExist).toBeCalled();
    });

    it("should yield an error when confile does not exist", async () => {
        configShouldExist.mockReturnValue(Promise.reject(new Error("config file does not exist")));
        await expect(status()).rejects.toThrow("config file does not exist");
    });

    it("should get the list of files in the migrations directory", async () => {
        await status();
        expect(migrationsDirGetFileNames).toBeCalled();
    });

    it("should yield errors that occurred when getting the list of files in the migrations directory", async () => {
        migrationsDirGetFileNames.mockReturnValue(Promise.reject(new Error("File system unavailable")));
        await expect(status()).rejects.toThrow("File system unavailable");
    });

    it("should fetch the content of the migrationsLogDb collection", async () => {
        await status();
        expect(migrationsDbGetAllMigrations).toBeCalled();
    });

    it("should yield errors that occurred when fetching the migrationsLogDb collection", async () => {
        migrationsDbGetAllMigrations.mockReturnValue(Promise.reject(new Error("Cannot read from the database")));
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