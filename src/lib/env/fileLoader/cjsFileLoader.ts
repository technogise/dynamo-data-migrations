import { FileLoader, Migration } from './fileLoader';
import * as paths from '../paths';
import { importCjs } from '../../utils/moduleLoader';

export class CjsFileLoader extends FileLoader {
    constructor() {
        super(paths.cjsExtension, paths.cjsMigrationPath);
    }

    async loadMigrationFile(importPath: string): Promise<Migration> {
        return importCjs(importPath);
    }
}
