import url from 'url';
import { FileLoader, AwsConfig } from './fileLoader';
import * as paths from '../paths';
import { importCjs } from '../../utils/moduleLoader';

export class CjsFileLoader extends FileLoader {
    constructor() {
        super(paths.cjsExtension, paths.cjsMigrationPath, paths.cjsConfigFilePath);
    }

    async loadAWSConfig(): Promise<AwsConfig[]> {
        const configFileDetails = await importCjs(url.pathToFileURL(this.configPath).pathname);
        return configFileDetails.awsConfig;
    }

    async loadMigrationFile(importPath: string): Promise<any> {
        return importCjs(importPath);
    }
}
