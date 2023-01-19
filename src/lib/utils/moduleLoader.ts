import * as tsImport from 'ts-import';

export function importFile(importPath: string) {
    return tsImport.loadSync(importPath);
}
