import { TsFileLoader } from '../../../../src/lib/env/fileLoader/tsFileLoader';
import * as moduleLoader from '../../../../src/lib/utils/moduleLoader';

describe("tsFileLoader", () => {

    const tsFileLoader = new TsFileLoader();
    const expectedAwsConfig = {
        awsConfig: [{
            profile: 'test',
            region: 'abc'

        }]
    };

    describe("loadAWSConfig()", () => {
        it("should load AWSConfig from config file", async () => {
            jest.spyOn(moduleLoader, "importFile").mockResolvedValue(expectedAwsConfig);
            const actualAwsConfig = await tsFileLoader.loadAWSConfig();
            expect(actualAwsConfig).toEqual(expectedAwsConfig.awsConfig);
        });
    })

    describe("loadMigrationFile()", () => {
        it("should load Migration file", async () => {
            jest.spyOn(moduleLoader, "importFile").mockImplementation(() => Promise.resolve());
            await tsFileLoader.loadMigrationFile('testPath');
            expect(moduleLoader.importFile).toBeCalledTimes(1);
            expect(moduleLoader.importFile).toBeCalledWith('testPath');
        });
    })

})