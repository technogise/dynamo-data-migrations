import { CjsFileLoader } from '../../../../src/lib/env/fileLoader/cjsFileLoader';
import * as moduleLoader from '../../../../src/lib/utils/moduleLoader';

describe("cjsFileLoader", () => {

    const cjsFileLoader = new CjsFileLoader();
    const expectedAwsConfig = {
        awsConfig: [{
            profile: 'test',
            region: 'abc'

        }]
    };

    describe("loadAWSConfig()", () => {
        it("should load AWSConfig from config file", async () => {
            jest.spyOn(moduleLoader, "importCjs").mockResolvedValue(expectedAwsConfig);
            const actualAwsConfig = await cjsFileLoader.loadAWSConfig();
            expect(actualAwsConfig).toEqual(expectedAwsConfig.awsConfig);
        });
    })

    describe("loadMigrationFile()", () => {
        it("should load Migration file", async () => {
            jest.spyOn(moduleLoader, "importCjs").mockImplementation(() => Promise.resolve());
            await cjsFileLoader.loadMigrationFile('testPath');
            expect(moduleLoader.importCjs).toBeCalledTimes(1);
            expect(moduleLoader.importCjs).toBeCalledWith('testPath');
        });
    })

})