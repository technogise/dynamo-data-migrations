import url from 'url';
import { FileLoader, AwsConfig } from './fileLoader';
import * as paths from '../paths';

export class MjsFileLoader extends FileLoader {
    constructor() {
        super(paths.mjsExtension, paths.mjsMigrationPath, paths.mjsConfigFilePath);
    }

    async loadAWSConfig(): Promise<AwsConfig[]> {
        const esmModuleLoader = await import('../../utils/esmModuleLoader.mjs');
        const configFileDetails = await esmModuleLoader.importMjs(url.pathToFileURL(this.configPath).pathname);
        return configFileDetails.awsConfig;
    }

    async loadMigrationFile(importPath: string): Promise<any> {
        const esmModuleLoader = await import('../../utils/esmModuleLoader.mjs');
        return esmModuleLoader.importMjs(url.pathToFileURL(importPath).pathname);
    }
}
