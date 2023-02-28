import fs from "fs-extra";
import { create } from "../../../src/lib/actions/create"
import * as migrationsDir from "../../../src/lib/env/migrationsDir";
import * as config from '../../../src/lib/env/config';
import { TsFileLoader } from "../../../src/lib/env/fileLoader/tsFileLoader";

describe("create", () => {

    it("should yield an error when called without a description", async () => {
        await expect(create("")).rejects.toThrow('Please pass a valid description');
    });

    it("should yield an error if the migrations directory does not exists", async () => {
        jest.spyOn(migrationsDir, "isMigrationDirPresent").mockReturnValue(false);
        await expect(create("my_description")).rejects.toThrow("Please ensure migrations directory as specified in config.json is present");
    });

    it("should copy the sample migrations to the migrations directory and return appropriate message", async () => {
        const fsCopyFile = jest.spyOn(fs, "copyFile").mockReturnValue();
        jest.spyOn(migrationsDir, "isMigrationDirPresent").mockReturnValue(true);
        jest.spyOn(config, "getFileLoader").mockReturnValue(new TsFileLoader());
        jest.spyOn(migrationsDir, "resolveMigrationsDirPath").mockReturnValue('/migrations');
        const message = await create("my_description");
        expect(fsCopyFile).toBeCalled();
        expect(message).toMatch(/my_description/);
    })

})