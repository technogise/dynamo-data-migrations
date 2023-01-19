import path from "path";
import fs from "fs-extra";
import * as moduleLoader from "../../../src/lib/utils/moduleLoader";
import * as config from "../../../src/lib/env/config";


describe("config", () => {
    describe("isConfigFilePresent():true", () => {
        it("should return true if config file exists", () => {
            jest.spyOn(fs, "existsSync").mockReturnValue(true);
            const actualValue = config.isConfigFilePresent();
            expect(actualValue).toBeTruthy();
        });
    })

    describe("isConfigFilePresent():false", () => {
        it("should return false if the config does not exist", () => {
            const actualValue = config.isConfigFilePresent();
            expect(actualValue).toBeFalsy();
        });
    })

    describe("readConfig()", () => {
        it("should attempt to read the config file", () => {
            const configPath = path.join(process.cwd(), "setup.db/config.js");
            jest.spyOn(moduleLoader, "importFile").mockImplementation(() => {
                throw new Error(`Cannot find module '${configPath}'`);
            });
            expect(() => { config.readConfig(); }).toThrow(`Cannot find module '${configPath}'`)
        });

        it("should return aws config from config file", async () => {
            const expectedAwsConfig = {
                awsConfig: [{
                    profile: 'test',
                    region: 'abc'

                }]
            };
            jest.spyOn(moduleLoader, "importFile").mockReturnValue(expectedAwsConfig);
            const actualAwsConfig = config.readConfig();
            expect(actualAwsConfig).toEqual(expectedAwsConfig.awsConfig);
        });
    })

})