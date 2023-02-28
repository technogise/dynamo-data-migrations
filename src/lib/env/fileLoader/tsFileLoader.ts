import { FileLoader, Migration } from './fileLoader';
import * as paths from '../paths';
import { importFile } from '../../utils/moduleLoader';

export class TsFileLoader extends FileLoader {
    constructor() {
        super(paths.tsExtension, paths.tsMigrationPath);
    }

    async loadMigrationFile(importPath: string): Promise<Migration> {
        return importFile(importPath);
    }
}
