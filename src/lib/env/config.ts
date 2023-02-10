import fs from 'fs-extra';
import * as paths from './paths';
import { CjsFileLoader } from './fileLoader/cjsFileLoader';
import { TsFileLoader } from './fileLoader/tsFileLoader';
import { MjsFileLoader } from './fileLoader/mjsFileLoader';

export function isConfigFilePresent() {
    return (
        fs.existsSync(paths.cjsConfigFilePath) ||
        fs.existsSync(paths.mjsConfigFilePath) ||
        fs.existsSync(paths.tsConfigFilePath)
    );
}

export async function readConfig() {
    const configFile = getFileLoader();
    return configFile.loadAWSConfig();
}

export function initializeConfig(ext: string) {
    switch (ext) {
        case 'ts':
            fs.copySync(paths.tsConfigTemplatePath, paths.tsConfigFilePath);
            break;
        case 'cjs':
            fs.copySync(paths.cjsConfigTemplatePath, paths.cjsConfigFilePath);
            break;
        case 'esm':
            fs.copySync(paths.mjsConfigTemplatePath, paths.mjsConfigFilePath);
            break;
        default:
            throw new Error('Unsupported file extension. Ensure file extension is ts,cjs or esm');
    }
}

export function getFileLoader() {
    if (fs.existsSync(paths.tsConfigFilePath)) {
        return new TsFileLoader();
    }
    if (fs.existsSync(paths.cjsConfigFilePath)) {
        return new CjsFileLoader();
    }
    if (fs.existsSync(paths.mjsConfigFilePath)) {
        return new MjsFileLoader();
    }
    throw new Error(
        'Unsupported extension of config file, please ensure config file has extension of either .ts,.cjs or .mjs',
    );
}
