import fs from "fs-extra";

import { create } from "../../../src/lib/actions/create"
import * as migrationsDir from "../../../src/lib/env/migrationsDir";
import * as migrationsDb from "../../../src/lib/env/migrationsDb";

describe("create",()=>{
    let migrationsDirShouldExist: { mockRestore: () => void; };
    let migrationsDirResolveMigrationsDirPath: { mockRestore: () => void; };
    let migrationsDbDoesMigrationsLogDbExists: { mockRestore: () => void; };
    let migrationsDbConfigureMigrationsLogDbSchema: { mockRestore: () => void; };
    let fsCopyFile: { mockRestore: () => void; };
    
    beforeEach(async()=>{
        migrationsDirShouldExist = jest.spyOn(migrationsDir,"shouldExist").mockReturnValue(Promise.resolve());
        migrationsDirResolveMigrationsDirPath = jest.spyOn(migrationsDir,"resolveMigrationsDirPath").mockReturnValue(Promise.resolve("setup.db/migrations"));
        migrationsDbDoesMigrationsLogDbExists = jest.spyOn(migrationsDb,"doesMigrationsLogDbExists").mockReturnValue(Promise.resolve());
        migrationsDbConfigureMigrationsLogDbSchema = jest.spyOn(migrationsDb,"configureMigrationsLogDbSchema").mockReturnValue(Promise.resolve());
        fsCopyFile = jest.spyOn(fs,"copyFile").mockReturnValue();
    });

    afterEach(async()=>{
        migrationsDirShouldExist.mockRestore();
        migrationsDirResolveMigrationsDirPath.mockRestore();
        migrationsDbDoesMigrationsLogDbExists.mockRestore();
        migrationsDbConfigureMigrationsLogDbSchema.mockRestore();
        fsCopyFile.mockRestore();
    })

    it("should yield an error when called without a description", async()=>{
        const emptyDescription = "";
        await expect(create(emptyDescription)).rejects.toThrow('Missing parameter: description');
    });

    it("should check if the migrations directory exists", async()=>{
        const shouldExist = jest.spyOn(migrationsDir,"shouldExist");
        await create("my_description");
        expect(shouldExist).toHaveBeenCalled();
    });

    it("should yield an error if the migrations directory does not exists", async()=>{
        jest.spyOn(migrationsDir,"shouldExist").mockRejectedValue(new Error("migrations directory does not exist"));
        await expect(create("my_description")).rejects.toThrow("migrations directory does not exist");
    });

    it("should check if the migrationsLogDb Exists on AWS", async()=>{
        const doesMigrationsLogDbExists = jest.spyOn(migrationsDb,"doesMigrationsLogDbExists");
        await create("my_description");
        expect(doesMigrationsLogDbExists).toBeCalled();
    });

    it("should not create a migrationsLogDb on AWS if it already eixsts", async()=>{
        jest.spyOn(migrationsDb,"doesMigrationsLogDbExists").mockResolvedValue("created");
        const configureMigrationsLogDbSchema = jest.spyOn(migrationsDb,"configureMigrationsLogDbSchema");
        await create("my_description");
        expect(configureMigrationsLogDbSchema).toBeCalledTimes(0);
    });

    it("should create a migrationsLogDb on AWS if it does not eixsts", async()=>{
        jest.spyOn(migrationsDb,"doesMigrationsLogDbExists").mockRejectedValue(new Error("Requested resource not found"));
        const configureMigrationsLogDbSchema = jest.spyOn(migrationsDb,"configureMigrationsLogDbSchema");
        await create("my_description");
        expect(configureMigrationsLogDbSchema).toBeCalled();
    });

    it("should copy the sample migrations to the migrations directory",async()=>{
        const copyFile = jest.spyOn(fs,"copyFile");
        await create("my_description");
        expect(copyFile).toBeCalled();
    })

    it("should return a message when migrations are created",async()=>{
        const message = await create("my_description");
        expect(message).toMatch(/Created: migrations/);
    });

})