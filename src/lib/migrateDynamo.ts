// import { init } from './actions/init';
import { copySampleConfigFile, createMigrationsDirectory } from './actions/init';
// const init = require('./actions/init');
// import { create } from './actions/create';
import { create } from './actions/create';

export const initAction = () => {
    copySampleConfigFile();
    createMigrationsDirectory();
};

export const createAction = (description: string) => {
    create(description);
};
