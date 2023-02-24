import path from "path";
import fs from "fs-extra";
import * as migrationsDir from "../../../src/lib/env/migrationsDir";
import * as config from "../../../src/lib/env/config"




describe("check scenarios related to migration directory", () => {
    describe("resolveMigrationsDirPath()", () => {
        it("should use load the migrations folder as specified in config for relative path", () => {
            jest.spyOn(config,"loadMigrationsDir").mockReturnValue("migrations");
            const expectedValue = path.join(process.cwd(), "migrations");
            const actualValue = migrationsDir.resolveMigrationsDirPath();
            expect(actualValue).toBe(expectedValue);
        });
        it("should use load the migrations folder as specified in config for absolute path", () => {
            jest.spyOn(config,"loadMigrationsDir").mockReturnValue("/migrations");
            const expectedValue = "/migrations";
            const actualValue = migrationsDir.resolveMigrationsDirPath();
            expect(actualValue).toBe(expectedValue);
        });
    })

    describe("isMigrationDirPresent():true", () => {
        it("should not reject with an error if the migrations dir exists", () => {
            jest.spyOn(config,"loadMigrationsDir").mockReturnValue("/migrations");
            jest.spyOn(fs, "existsSync").mockReturnValue(true);
            const actualValue = migrationsDir.isMigrationDirPresent();
            expect(actualValue).toBeTruthy();
        });
    })

    describe("isMigrationDirPresent():false", () => {
        it("should return false if the migrations dir does not exist", () => {
            jest.spyOn(config,"loadMigrationsDir").mockReturnValue("/mig");
            const actualValue = migrationsDir.isMigrationDirPresent();
            expect(actualValue).toBeFalsy();
        });
    })

    describe("getFileNamesInMigrationFolder()", () => {
        it("should read the directory and yield the result if directory is present", () => {
            jest.spyOn(config,"loadMigrationsDir").mockReturnValue("/migrations");
            jest.spyOn(fs, "existsSync").mockReturnValue(true);
            fs.readdirSync = jest.fn().mockReturnValue(["file1.ts", "file2.ts"]);
            const files = migrationsDir.getFileNamesInMigrationFolder();
            expect(files).toEqual(["file1.ts", "file2.ts"]);
        });

        it("should throw an error if migration directory is not present", () => {
            jest.spyOn(config,"loadMigrationsDir").mockReturnValue("/mig");
            jest.spyOn(fs, "existsSync").mockReturnValue(false);      
            expect(() => migrationsDir.getFileNamesInMigrationFolder()).toThrow('Please ensure migrations directory as specified in config.json is present');
        });

        it("should be sorted in alphabetical order", () => {
            jest.spyOn(config,"loadMigrationsDir").mockReturnValue("/migrations");
            jest.spyOn(fs, "existsSync").mockReturnValue(true);
            fs.readdirSync = jest.fn().mockReturnValue([
                "20201014172343-test.ts",
                "20201014172356-test3.ts",
                "20201014172354-test2.ts",
                "20201014172345-test1.ts"
            ]);
            const files = migrationsDir.getFileNamesInMigrationFolder();
            expect(files).toEqual([
                "20201014172343-test.ts",
                "20201014172345-test1.ts",
                "20201014172354-test2.ts",
                "20201014172356-test3.ts"
            ]);
        });
    })

    describe("loadMigration()", () => {
        it("should attempt to read the migration file", async () => {
            jest.spyOn(config,"loadMigrationsDir").mockReturnValue("/migrations");
            jest.spyOn(fs, "existsSync").mockReturnValue(true);
            jest.spyOn(config,"getFileLoader").mockImplementation(() => {
                throw new Error('Unsupported extension of config file, please ensure config file has extension of either .ts,.cjs or .mjs');
            })
           await expect(migrationsDir.loadFilesToBeMigrated("abc.ts")).rejects.toThrow('Unsupported extension of config file, please ensure config file has extension of either .ts,.cjs or .mjs');
        })
        it("should throw an error when migration directory does not exist", async () => {
            jest.spyOn(config,"loadMigrationsDir").mockReturnValue("/migrations");
            jest.spyOn(fs, "existsSync").mockReturnValue(false);
           await expect(migrationsDir.loadFilesToBeMigrated("abc.ts")).rejects.toThrow('Please ensure migrations directory as specified in config.json is present');
        })
    })
})