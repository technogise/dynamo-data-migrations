import path from "path";
import fs from "fs-extra";
import { when } from 'jest-when'
import * as moduleLoader from "../../../src/lib/utils/moduleLoader";
import * as config from "../../../src/lib/env/config";
import * as paths from '../../../src/lib/env/paths';
import { CjsFileLoader } from '../../../src/lib/env/fileLoader/cjsFileLoader';
import { TsFileLoader } from '../../../src/lib/env/fileLoader/tsFileLoader';
import { MjsFileLoader } from '../../../src/lib/env/fileLoader/mjsFileLoader';


describe("config", () => {

    let fsStub: jest.SpyInstance;
    let fileLoader: jest.SpyInstance;

    beforeEach(() => {
        fileLoader = jest.spyOn(fs, "copySync").mockImplementation(() => {});
        fsStub = jest.spyOn(fs, 'existsSync');
    })

    describe("isConfigFilePresent()", () => {
        it("should return true when existing config file is of extension .ts", () => {
            when(fsStub).calledWith(paths.tsConfigFilePath).mockReturnValue(true);
            when(fsStub).calledWith(paths.cjsConfigFilePath).mockReturnValue(false);
            when(fsStub).calledWith(paths.mjsConfigFilePath).mockReturnValue(false);
            const actualValue = config.isConfigFilePresent();
            expect(actualValue).toBeTruthy();
        });

        it("should return true when existing config file is of extension .cjs", () => {
            when(fsStub).calledWith(paths.tsConfigFilePath).mockReturnValue(false);
            when(fsStub).calledWith(paths.cjsConfigFilePath).mockReturnValue(true);
            when(fsStub).calledWith(paths.mjsConfigFilePath).mockReturnValue(false);
            const actualValue = config.isConfigFilePresent();
            expect(actualValue).toBeTruthy();
        });

        it("should return true when existing config file is of extension .mjs", () => {
            when(fsStub).calledWith(paths.tsConfigFilePath).mockReturnValue(false);
            when(fsStub).calledWith(paths.cjsConfigFilePath).mockReturnValue(false);
            when(fsStub).calledWith(paths.mjsConfigFilePath).mockReturnValue(true);
            const actualValue = config.isConfigFilePresent();
            expect(actualValue).toBeTruthy();
        });

        it("should return false when existing config file is not of supported extension", () => {
            when(fsStub).calledWith(paths.tsConfigFilePath).mockReturnValue(false);
            when(fsStub).calledWith(paths.cjsConfigFilePath).mockReturnValue(false);
            when(fsStub).calledWith(paths.mjsConfigFilePath).mockReturnValue(false);
            const actualValue = config.isConfigFilePresent();
            expect(actualValue).toBeFalsy();
        });
    })

    describe("readConfig()", () => {
        it("should attempt to read the config file", async () => {
            const configPath = path.join(process.cwd(), "setup.db/config.js");
            jest.spyOn(fs, "existsSync").mockReturnValue(true);
            jest.spyOn(moduleLoader, "importFile").mockImplementation(() => {
                throw new Error(`Cannot find module '${configPath}'`);
            });
            await expect(config.readConfig()).rejects.toThrow(`Cannot find module '${configPath}'`)
        });

        it("should return aws config from config file", async () => {
            jest.spyOn(fs, "existsSync").mockReturnValue(true);
            const expectedAwsConfig = {
                awsConfig: [{
                    profile: 'test',
                    region: 'abc'

                }]
            };
            jest.spyOn(moduleLoader, "importFile").mockResolvedValue(expectedAwsConfig);
            const actualAwsConfig = await config.readConfig();
            expect(actualAwsConfig).toEqual(expectedAwsConfig.awsConfig);
        });
    })

    describe("getFileLoader()", () => {
        it("should return type fo tsfileLoader when existing config file is of extension .ts", () => {
            when(fsStub).calledWith(paths.tsConfigFilePath).mockReturnValue(true);
            const actualValue = config.getFileLoader();
            expect(actualValue).toEqual(new TsFileLoader());
        });
        it("should return type of mjfileLoader when existing config file is of extension .mjs", () => {
            when(fsStub).calledWith(paths.tsConfigFilePath).mockReturnValue(false);
            when(fsStub).calledWith(paths.cjsConfigFilePath).mockReturnValue(false);
            when(fsStub).calledWith(paths.mjsConfigFilePath).mockReturnValue(true);
            const actualValue = config.getFileLoader();
            expect(actualValue).toEqual(new MjsFileLoader());
        });
        it("should return type of cjsfileLoader when existing config file is of extension .cjs", () => {
            when(fsStub).calledWith(paths.tsConfigFilePath).mockReturnValue(false);
            when(fsStub).calledWith(paths.cjsConfigFilePath).mockReturnValue(true);
            when(fsStub).calledWith(paths.mjsConfigFilePath).mockReturnValue(false);
            const actualValue = config.getFileLoader();
            expect(actualValue).toEqual(new CjsFileLoader());
        });
        it("should throw error when existing config file is not of supported extension", () => {
            when(fsStub).calledWith(paths.tsConfigFilePath).mockReturnValue(false);
            when(fsStub).calledWith(paths.cjsConfigFilePath).mockReturnValue(false);
            when(fsStub).calledWith(paths.mjsConfigFilePath).mockReturnValue(false);
            expect(() => config.getFileLoader()).toThrow('Unsupported extension of config file, please ensure config file has extension of either .ts,.cjs or .mjs');
        });
    })

    describe("initializeConfig()", () => {
        it("should copy 'ts' templates when input ext is of type 'ts'", () => {
            config.initializeConfig('ts');
            expect(fileLoader).toBeCalledWith(paths.tsConfigTemplatePath, paths.tsConfigFilePath);
        });

        it("should copy 'cjs' templates when input ext is of type 'cjs'", () => {
            config.initializeConfig('cjs');
            expect(fileLoader).toBeCalledWith(paths.cjsConfigTemplatePath, paths.cjsConfigFilePath);
        });

        it("should copy 'mjs' templates when input ext is of type 'esm'", () => {
            config.initializeConfig('esm');
            expect(fileLoader).toBeCalledWith(paths.mjsConfigTemplatePath, paths.mjsConfigFilePath);
        });

        it("should throw error templates when input ext not supported", () => {
            expect(() => config.initializeConfig('tst')).toThrow('Unsupported file extension. Ensure file extension is ts,cjs or esm');
        });

    })
})