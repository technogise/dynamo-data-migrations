import path from "path";
import fs, { Stats } from "fs-extra";
import * as migrationsDir from "../../../src/lib/env/migrationsDir";
import * as moduleLoader from "../../../src/lib/utils/moduleLoader";

type ERROR = { errno: number; syscall: string; code: string; path: string };
jest.mock("fs-extra");

describe("migrationsDir",()=>{
    let fsStat:jest.SpyInstance;
    let fsReaddir:jest.SpyInstance;
    let moduleLoaderImportFile:jest.SpyInstance;
    beforeEach(()=>{
        fsStat = jest.spyOn(fs,"stat");
        fsReaddir = jest.spyOn(fs,"readdir");
        moduleLoaderImportFile = jest.spyOn(moduleLoader,"importFile");
    });

    afterEach(()=>{
        fsStat.mockRestore();
        fsReaddir.mockRestore();
        moduleLoaderImportFile.mockRestore();
    });

    describe("resolveMigrationsDirPath()",()=>{
        it("should use the default migrations directory", async () => {
            const shouldReturnValue = path.join(process.cwd(), "setup.db/migrations");
            const returnedValue = await migrationsDir.resolveMigrationsDirPath();
            expect(returnedValue).toBe(shouldReturnValue);
        });
    })

    describe("shouldExist()",()=>{
        it("should not reject with an error if the migrations dir exists", async () => {
            const stats = new Stats();
            jest.spyOn(fs,"stat").mockResolvedValue(stats);
            await expect(migrationsDir.shouldExist()).resolves.not.toThrowError();
        });

        it("should yield an error if the migrations dir does not exist", async () => {
            const migrationsPath = path.join(process.cwd(), "setup.db/migrations");
            jest.spyOn(fs,"stat").mockRejectedValue(new Error("It does not exist"));
            await expect(migrationsDir.shouldExist()).rejects
            .toThrow(`migrations directory does not exist: ${migrationsPath}`);
        });
    })

    describe("shouldNotExist()",()=>{
        it("should not yield an error if the migrations dir does not exist", async () => {
            const errorMock:ERROR = {
                errno: 123,
                syscall: "sys",
                code: "ENOENT",
                path: "abc"
            }
            jest.spyOn(fs,"stat").mockRejectedValue(errorMock);
            await expect(migrationsDir.shouldNotExist()).resolves.not.toThrowError();
        });

        it("should yield an error if the migrations dir exists", async () => {
            const migrationsPath = path.join(process.cwd(), "setup.db/migrations");
            const stats = new Stats();
            jest.spyOn(fs,"stat").mockResolvedValue(stats);
            await expect(migrationsDir.shouldNotExist()).rejects
            .toThrow(`migrations directory already exists: ${migrationsPath}`);
        });
    })

    describe("doesSampleMigrationExist()",()=>{
        it("should return true if sample migration exists", async () => {
            const stats = new Stats();
            jest.spyOn(fs,"stat").mockResolvedValue(stats);
            const result = await migrationsDir.doesSampleMigrationExist();
            expect(result).toEqual(true);
        });

        it("should return false if sample migration doesn't exists", async () => {
            const errorMock:ERROR = {
                errno: 123,
                syscall: "sys",
                code: "ENOENT",
                path: "abc"
            }
            jest.spyOn(fs,"stat").mockRejectedValue(errorMock);
            const result = await migrationsDir.doesSampleMigrationExist();
            expect(result).toEqual(false);
        });
    })

    describe("getFileNames()",()=>{
        it("should read the directory and yield the result", async () => {
            fs.readdir = jest.fn().mockResolvedValue(["file1.ts","file2.ts"]);
            const files = await migrationsDir.getFileNames();
            expect(files).toEqual(["file1.ts","file2.ts"]);
        });

        it("should be sorted in alphabetical order", async () => {
            fs.readdir = jest.fn().mockResolvedValue([
                "20201014172343-test.ts",
                "20201014172356-test3.ts",
                "20201014172354-test2.ts",
                "20201014172345-test1.ts"
            ]);
            const files = await migrationsDir.getFileNames();
            expect(files).toEqual([
                "20201014172343-test.ts",
                "20201014172345-test1.ts",
                "20201014172354-test2.ts",
                "20201014172356-test3.ts"
            ]);
        });
    })

    describe("loadMigration()",()=>{
        it("should attempt to read the migration file",async()=>{
            const migrationsPath = path.join(process.cwd(),"setup.db/migrations/abc.ts");
            jest.spyOn(moduleLoader,"importFile").mockImplementation(()=>{
                throw new Error(`Cannot find module '${migrationsPath}'`);
            });
            await expect(migrationsDir.loadMigration("abc.ts")).rejects.toThrow(`Cannot find module '${migrationsPath}'`);
        })
    })
})