import fs from 'fs';
import url from 'url';
import path from 'path';
import { get } from 'lodash';
import * as moduleLoader from '../utils/moduleLoader';

type CONFIG = { region?: string; accessKeyId?: string; secretAccessKey?: string };
type ERROR = { errno: number; syscall: string; code: string; path: string };

const customConfigContent: CONFIG = {};

export const DEFAULT_CONFIG_FILE_NAME = 'config.ts';

function getConfigPath() {
    // const fileOptionValue = get(global.options, 'file');
    const fileOptionValue = null;
    if (!fileOptionValue) {
        return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
    }

    if (path.isAbsolute(fileOptionValue)) {
        return fileOptionValue;
    }
    return path.join(process.cwd(), fileOptionValue);
}

export async function shouldNotExist() {
    if (Object.keys(customConfigContent).length === 0) {
        const configPath = getConfigPath();
        const error = new Error(`config file already exists: ${configPath}`);
        try {
            fs.statSync(configPath);
            throw error;
        } catch (error_) {
            const e = error_ as ERROR;
            if (e.code !== 'ENOENT') {
                throw error;
            }
        }
    }
}

export async function read() {
    if (Object.keys(customConfigContent).length > 0) {
        return customConfigContent;
    }
    const configPath = getConfigPath();
    const loadedImport = await moduleLoader.importFile(url.pathToFileURL(configPath).pathname);
    return loadedImport.default;
}
