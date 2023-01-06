import * as tsImport from 'ts-import';

export async function importFile(importPath: string) {
    const asyncResult = await tsImport.load(importPath);
    return asyncResult;
}
