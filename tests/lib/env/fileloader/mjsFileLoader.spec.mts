import { MjsFileLoader } from '../../../../src/lib/env/fileLoader/mjsFileLoader.js';
import * as moduleLoader from '../../../../src/lib/utils/esmModuleLoader.mjs';
describe("mjsFileLoader", () => {

    const mjsFileLoader = new MjsFileLoader();
    const expectedAwsConfig = {
        awsConfig: [{
            profile: 'test',
            region: 'abc'

        }]
    };

    describe("loadAWSConfig()", () => {
        it("should load AWSConfig from config file", async () => {
            jest.spyOn(moduleLoader, "importMjs").mockResolvedValue(expectedAwsConfig);
            const actualAwsConfig = await mjsFileLoader.loadAWSConfig();
            expect(actualAwsConfig).toEqual(expectedAwsConfig.awsConfig);
        });
    })

    describe("loadMigrationFile()", () => {
        it("should load Migration file", async () => {
            jest.spyOn(moduleLoader, "importMjs").mockImplementation(() => Promise.resolve());
            await mjsFileLoader.loadMigrationFile('testPath');
            expect(moduleLoader.importMjs).toBeCalledTimes(1);
            expect(moduleLoader.importMjs).toBeCalledWith('testPath');
        });
    })

})