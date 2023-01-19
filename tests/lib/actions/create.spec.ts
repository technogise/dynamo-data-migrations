import fs from "fs-extra";
import AWS from 'aws-sdk';
import { create } from "../../../src/lib/actions/create"
import * as migrationsDir from "../../../src/lib/env/migrationsDir";
import * as migrationsDb from "../../../src/lib/env/migrationsDb";

describe("create", () => {
    let migrationsDirShouldExist: jest.SpyInstance;
    let migrationsDbConfigureMigrationsLogDbSchema: jest.SpyInstance;
    let fsCopyFile: jest.SpyInstance;

    beforeEach(async () => {
        migrationsDirShouldExist = jest.spyOn(migrationsDir, "isMigrationDirPresent").mockReturnValue(true);
        migrationsDbConfigureMigrationsLogDbSchema=jest.spyOn(migrationsDb, "configureMigrationsLogDbSchema").mockReturnValue(Promise.resolve());
        jest.spyOn(migrationsDb, "getDdb").mockReturnValue(new AWS.DynamoDB({ apiVersion: '2012-08-10' }));
        fsCopyFile = jest.spyOn(fs, "copyFile").mockReturnValue();
    });


    it("should yield an error when called without a description", async () => {
        await expect(create("")).rejects.toThrow('Missing parameter: description');
    });

    it("should check if the migrations directory exists", async () => {
        await create("my_description");
        expect(migrationsDirShouldExist).toHaveBeenCalled();
    });

    it("should yield an error if the migrations directory does not exists", async () => {
        migrationsDirShouldExist.mockReturnValue(false);
        await expect(create("my_description")).rejects.toThrow("Migration directory not present. Ensure init command is executed.");
    });

    it("should check if the migrationsLogDb Exists on AWS", async () => {
        const doesMigrationsLogDbExists = jest.spyOn(migrationsDb, "doesMigrationsLogDbExists");
        await create("my_description");
        expect(doesMigrationsLogDbExists).toBeCalled();
    });

    it("should not create a migrationsLogDb on AWS if it already eixsts", async () => {
        jest.spyOn(migrationsDb, "doesMigrationsLogDbExists").mockResolvedValue("created");
        await create("my_description");
        expect(migrationsDbConfigureMigrationsLogDbSchema).toBeCalledTimes(0);
    });

    it("should create a migrationsLogDb on AWS if it does not eixsts", async () => {
        jest.spyOn(migrationsDb, "doesMigrationsLogDbExists").mockRejectedValue(new Error("Requested resource not found"));
        await create("my_description");
        expect(migrationsDbConfigureMigrationsLogDbSchema).toBeCalled();
    });

    it("should copy the sample migrations to the migrations directory and return appropriate message", async () => {
        const message = await create("my_description");
        expect(fsCopyFile).toBeCalled();
        expect(message).toMatch(/Created: migrations/);
    })

})