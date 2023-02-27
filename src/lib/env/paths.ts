import path from 'path';

export const tsMigrationPath = path.join(__dirname, `../../templates/ts/migration.template`);
export const cjsMigrationPath = path.join(__dirname, `../../templates/commonjs/migration.template`);
export const mjsMigrationPath = path.join(__dirname, `../../templates/esm/migration.template`);

export const mjsExtension = '.mjs';
export const tsExtension = '.ts';
export const cjsExtension = '.cjs';

export const configJsonPath = path.join(__dirname, `../../config.json`);
export const targetConfigPath = path.join(process.cwd(), 'config.json');
