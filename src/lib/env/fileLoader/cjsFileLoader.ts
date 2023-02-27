import { FileLoader } from './fileLoader';
import * as paths from '../paths';
import { importCjs } from '../../utils/moduleLoader';

export class CjsFileLoader extends FileLoader {
    constructor() {
        super(paths.cjsExtension, paths.cjsMigrationPath);
    }

    async loadMigrationFile(importPath: string): Promise<any> {
        return importCjs(importPath);
    }
}
