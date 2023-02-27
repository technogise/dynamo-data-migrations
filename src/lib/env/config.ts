import fs from 'fs-extra';
import * as paths from './paths';
import { CjsFileLoader } from './fileLoader/cjsFileLoader';
import { TsFileLoader } from './fileLoader/tsFileLoader';
import { MjsFileLoader } from './fileLoader/mjsFileLoader';
import config from '../../templates/config.json';

const tsMigrationType = 'ts';
const cjsMigrationType = 'cjs';
const mjsMigrationType = 'mjs';

export function isConfigFilePresent() {
    return fs.existsSync(paths.targetConfigPath);
}

export function initializeConfig() {
    fs.writeFileSync(paths.targetConfigPath, JSON.stringify(config, null, 4));
}

export function getFileLoader() {
    const configDetails = loadConfig();
    switch (configDetails.migrationType) {
        case tsMigrationType:
            return new TsFileLoader();
        case cjsMigrationType:
            return new CjsFileLoader();
        case mjsMigrationType:
            return new MjsFileLoader();
        default:
            throw new Error('Unsupported migration type in config.json. Ensure migration type is ts,cjs or mjs');
    }
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
