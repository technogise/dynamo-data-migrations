import fs from 'fs-extra';
import * as paths from './paths';
import { CjsFileLoader } from './fileLoader/cjsFileLoader';
import { TsFileLoader } from './fileLoader/tsFileLoader';
import { MjsFileLoader } from './fileLoader/mjsFileLoader';
import config from '../../templates/config.json';

export function isConfigFilePresent() {
    return fs.existsSync(paths.targetConfigPath);
}

export function initializeConfig(ext: string) {
    switch (ext) {
        case 'ts':
            config.migrationFileExtension = paths.tsExtension;
            break;
        case 'cjs':
            config.migrationFileExtension = paths.cjsExtension;
            break;
        case 'esm':
            config.migrationFileExtension = paths.mjsExtension;
            break;
        default:
            throw new Error('Unsupported file extension. Ensure file extension is ts,cjs or esm');
    }
    fs.writeFileSync(paths.targetConfigPath, JSON.stringify(config, null, 4));
}

export function getFileLoader() {
    const configDetails = loadConfig();
    if (configDetails.migrationFileExtension === paths.tsExtension) {
        return new TsFileLoader();
    }
    if (configDetails.migrationFileExtension === paths.cjsExtension) {
        return new CjsFileLoader();
    }
    if (configDetails.migrationFileExtension === paths.mjsExtension) {
        return new MjsFileLoader();
    }
    throw new Error(
        'Unsupported extension in config file for key migrationFileExtension, ensure value is either .ts,.cjs or .mjs',
    );
}

export function loadAWSConfig() {
    const configDetails = loadConfig();
    return configDetails.awsConfig;
}

export function loadMigrationsDir() {
    const configDetails = loadConfig();
    return configDetails.migrationsDir;
}

function loadConfig() {
    try {
        const contents = fs.readFileSync(paths.targetConfigPath, 'utf8');
        return JSON.parse(contents);
    } catch {
        throw new Error(
            'Unable to load config, ensure config.json file exists, if not initialize it with init command',
        );
    }
}
