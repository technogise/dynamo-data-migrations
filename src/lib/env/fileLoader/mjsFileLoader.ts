import url from 'url';
import { FileLoader } from './fileLoader';
import * as paths from '../paths';

export class MjsFileLoader extends FileLoader {
    constructor() {
        super(paths.mjsExtension, paths.mjsMigrationPath);
    }

    async loadMigrationFile(importPath: string): Promise<any> {
        const esmModuleLoader = await import('../../utils/esmModuleLoader.mjs');
        return esmModuleLoader.importMjs(url.pathToFileURL(importPath).pathname);
    }
}
