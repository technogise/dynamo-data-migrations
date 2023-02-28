import fs from "fs-extra";
import { when } from 'jest-when'
import * as config from "../../../src/lib/env/config";
import * as paths from '../../../src/lib/env/paths';
import { CjsFileLoader } from '../../../src/lib/env/fileLoader/cjsFileLoader';
import { TsFileLoader } from '../../../src/lib/env/fileLoader/tsFileLoader';
import { MjsFileLoader } from '../../../src/lib/env/fileLoader/mjsFileLoader';
import configDetails from '../../../src/templates/config.json'


describe("config", () => {

    let fsStub: jest.SpyInstance;
    let fileWriter: jest.SpyInstance;

    beforeEach(() => {
        fsStub = jest.spyOn(fs, 'existsSync');
        fileWriter = jest.spyOn(fs, "writeFileSync");
        fileWriter.mockImplementation(() => {});
        jest.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(configDetails));
    })

    describe("isConfigFilePresent()", () => {
        it("should return true when existing config file exists", () => {
            when(fsStub).calledWith(paths.targetConfigPath).mockReturnValue(true);
            const actualValue = config.isConfigFilePresent();
            expect(actualValue).toBeTruthy();
        });

        it("should return false when existing config file is not present", () => {
            when(fsStub).calledWith(paths.targetConfigPath).mockReturnValue(false);
            const actualValue = config.isConfigFilePresent();
            expect(actualValue).toBeFalsy();
        });
    })

    describe("getFileLoader()", () => {
        it("should return type fo tsfileLoader when migration type is ts", () => {
            configDetails.migrationType = "ts";
            jest.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(configDetails));
            when(fsStub).calledWith(paths.targetConfigPath).mockReturnValue(true);
            const actualValue = config.getFileLoader();
            expect(actualValue).toEqual(new TsFileLoader());
        });
        it("should return type of mjfileLoader when migration type is mjs", () => {
            configDetails.migrationType = "mjs";
            jest.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(configDetails));
            when(fsStub).calledWith(paths.targetConfigPath).mockReturnValue(true);
            const actualValue = config.getFileLoader();
            expect(actualValue).toEqual(new MjsFileLoader());
        });
        it("should return type of cjsfileLoader when migration type is cjs", () => {
            configDetails.migrationType = "cjs";
            jest.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(configDetails));
            when(fsStub).calledWith(paths.targetConfigPath).mockReturnValue(true);
            const actualValue = config.getFileLoader();
            expect(actualValue).toEqual(new CjsFileLoader());
        });
        it("should throw error when migration type is not supported", () => {
            configDetails.migrationType = ".test";
            jest.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(configDetails));
            when(fsStub).calledWith(paths.targetConfigPath).mockReturnValue(true);
            expect(() => config.getFileLoader()).toThrow('Unsupported migration type in config.json. Ensure migration type is ts,cjs or mjs');
        });
    })

    describe("initializeConfig()", () => {
        it("should copy sample config.json to target path during initialization", () => {
            config.initializeConfig();
            expect(fileWriter).toBeCalledWith(paths.targetConfigPath, JSON.stringify(configDetails, null, 4));
        });
    })

    describe("loadAWSConfig()", () => {
        it("should load aws config from config.json", () => {
            const actualAwsConfig = config.loadAWSConfig();
            expect(actualAwsConfig).toEqual(configDetails.awsConfig);
        });

    })

    describe("loadMigrationsDir()", () => {
        it("should load migration dir from config.json", () => {
            const migrationDir = config.loadMigrationsDir();
            expect(migrationDir).toEqual(configDetails.migrationsDir);
        });

    })
})



