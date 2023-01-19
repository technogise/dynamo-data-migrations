import fs from 'fs-extra';
import url from 'url';
import path from 'path';
import * as moduleLoader from '../utils/moduleLoader';

export const DEFAULT_CONFIG_FILE_NAME = 'config.ts';

function getConfigPath() {
    return path.join(process.cwd(), `setup.db/${DEFAULT_CONFIG_FILE_NAME}`);
}

export function isConfigFilePresent() {
    return fs.existsSync(getConfigPath());
}

export function readConfig() {
    const configPath = getConfigPath();
    const loadedImport = moduleLoader.importFile(url.pathToFileURL(configPath).pathname);
    return loadedImport.awsConfig;
}
