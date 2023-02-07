import url from 'url';
import { FileLoader, AwsConfig } from './fileLoader';
import * as paths from '../paths';
import { importFile } from '../../utils/moduleLoader';

export class TsFileLoader extends FileLoader {
    constructor() {
        super(paths.tsExtension, paths.tsMigrationPath, paths.tsConfigFilePath);
    }

    async loadAWSConfig(): Promise<AwsConfig[]> {
        const configFileDetails = await importFile(url.pathToFileURL(this.configPath).pathname);
        return configFileDetails.awsConfig;
    }

    async loadMigrationFile(importPath: string): Promise<any> {
        return importFile(importPath);
    }
}
