import path from "path";
import fs from "fs-extra";
import * as migrationsDir from "../../../src/lib/env/migrationsDir";
import * as moduleLoader from "../../../src/lib/utils/moduleLoader";


describe("check scenarios related to migration directory", () => {
    describe("resolveMigrationsDirPath()", () => {
        it("should use the default migrations directory", () => {
            const expectedValue = path.join(process.cwd(), "setup.db/migrations");
            const actualValue = migrationsDir.resolveMigrationsDirPath();
            expect(actualValue).toBe(expectedValue);
        });
    })

    describe("isMigrationDirPresent():true", () => {
        it("should not reject with an error if the migrations dir exists", () => {
            jest.spyOn(fs, "existsSync").mockReturnValue(true);
            const actualValue = migrationsDir.isMigrationDirPresent();
            expect(actualValue).toBeTruthy();
        });
    })

    describe("isMigrationDirPresent():false", () => {
        it("should return false if the migrations dir does not exist", () => {
            const actualValue = migrationsDir.isMigrationDirPresent();
            expect(actualValue).toBeFalsy();
        });
    })

    describe("getFileNamesToBeMigrated()", () => {
        it("should read the directory and yield the result", () => {
            fs.readdirSync = jest.fn().mockReturnValue(["file1.ts", "file2.ts"]);
            const files = migrationsDir.getFileNamesToBeMigrated();
            expect(files).toEqual(["file1.ts", "file2.ts"]);
        });

        it("should be sorted in alphabetical order", () => {
            fs.readdirSync = jest.fn().mockReturnValue([
                "20201014172343-test.ts",
                "20201014172356-test3.ts",
                "20201014172354-test2.ts",
                "20201014172345-test1.ts"
            ]);
            const files = migrationsDir.getFileNamesToBeMigrated();
            expect(files).toEqual([
                "20201014172343-test.ts",
                "20201014172345-test1.ts",
                "20201014172354-test2.ts",
                "20201014172356-test3.ts"
            ]);
        });
    })

    describe("loadMigration()", () => {
        it("should attempt to read the migration file", () => {
            const migrationsPath = path.join(process.cwd(), "setup.db/migrations/abc.ts");
            jest.spyOn(moduleLoader, "importFile").mockImplementation(() => {
                throw new Error(`Cannot find module '${migrationsPath}'`);
            });
            expect(() => { migrationsDir.loadFilesToBeMigrated("abc.ts"); }).toThrow(`Cannot find module '${migrationsPath}'`);
        })
    })
})