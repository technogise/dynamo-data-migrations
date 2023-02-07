import path from 'path';

export const tsConfigTemplatePath = path.join(__dirname, `../../templates/ts/config.template`);
export const cjsConfigTemplatePath = path.join(__dirname, `../../templates/commonjs/config.template`);
export const mjsConfigTemplatePath = path.join(__dirname, `../../templates/esm/config.template`);

export const cjsConfigFilePath = path.join(process.cwd(), 'setup.db/config.cjs');
export const mjsConfigFilePath = path.join(process.cwd(), 'setup.db/config.mjs');
export const tsConfigFilePath = path.join(process.cwd(), 'setup.db/config.ts');

export const tsMigrationPath = path.join(__dirname, `../../templates/ts/migration.template`);
export const cjsMigrationPath = path.join(__dirname, `../../templates/commonjs/migration.template`);
export const mjsMigrationPath = path.join(__dirname, `../../templates/esm/migration.template`);

export const mjsExtension = '.mjs';
export const tsExtension = '.ts';
export const cjsExtension = '.cjs';
