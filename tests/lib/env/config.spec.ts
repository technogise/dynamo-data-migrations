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
        it("should return type fo tsfileLoader when existing config file is of extension .ts", () => {
            configDetails.migrationFileExtension = ".ts";
            jest.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(configDetails));
            when(fsStub).calledWith(paths.targetConfigPath).mockReturnValue(true);
            const actualValue = config.getFileLoader();
            expect(actualValue).toEqual(new TsFileLoader());
        });
        it("should return type of mjfileLoader when existing config file is of extension .mjs", () => {
            configDetails.migrationFileExtension = ".mjs";
            jest.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(configDetails));
            when(fsStub).calledWith(paths.targetConfigPath).mockReturnValue(true);
            const actualValue = config.getFileLoader();
            expect(actualValue).toEqual(new MjsFileLoader());
        });
        it("should return type of cjsfileLoader when existing config file is of extension .cjs", () => {
            configDetails.migrationFileExtension = ".cjs";
            jest.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(configDetails));
            when(fsStub).calledWith(paths.targetConfigPath).mockReturnValue(true);
            const actualValue = config.getFileLoader();
            expect(actualValue).toEqual(new CjsFileLoader());
        });
        it("should throw error when existing config file is not of supported extension", () => {
            configDetails.migrationFileExtension = ".test";
            jest.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(configDetails));
            when(fsStub).calledWith(paths.targetConfigPath).mockReturnValue(true);
            expect(() => config.getFileLoader()).toThrow('Unsupported extension in config file for key migrationFileExtension, ensure value is either .ts,.cjs or .mjs');
        });
    })

    describe("initializeConfig()", () => {
        it("should copy 'ts' templates when input ext is of type 'ts'", () => {
            configDetails.migrationFileExtension = ".js";
            config.initializeConfig('ts');
            expect(fileWriter).toBeCalledWith(paths.targetConfigPath, JSON.stringify(configDetails, null, 4));
        });

        it("should copy 'cjs' templates when input ext is of type 'cjs'", () => {
            configDetails.migrationFileExtension = ".cjs";
            config.initializeConfig('cjs');
            expect(fileWriter).toBeCalledWith(paths.targetConfigPath, JSON.stringify(configDetails, null, 4));
        });

        it("should copy 'mjs' templates when input ext is of type 'esm'", () => {
            configDetails.migrationFileExtension = ".mjs";
            config.initializeConfig('esm');
            expect(fileWriter).toBeCalledWith(paths.targetConfigPath, JSON.stringify(configDetails, null, 4));
        });

        it("should throw error templates when input ext not supported", () => {
            expect(() => config.initializeConfig('tst')).toThrow('Unsupported file extension. Ensure file extension is ts,cjs or esm');
        });

    })

    describe("loadAWSConfig()", () => {
        it("should load aws config from config.json", () => {
            const actualAwsConfig = config.loadAWSConfig();
            expect(actualAwsConfig).toEqual(configDetails.awsConfig);
        });

    })

    describe("loadMigrationsDir()", () => {
        it("should load aws config from config.json", () => {
            const actualAwsConfig = config.loadMigrationsDir();
            expect(actualAwsConfig).toEqual(configDetails.migrationsDir);
        });
        it("should load migrarttion dir from config.json", () => {
            const migrationDir = config.loadMigrationsDir();
            expect(migrationDir).toEqual(configDetails.migrationsDir);
        });


    })
})



