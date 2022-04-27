import { Init } from './actions/init';

export const initAction = () => {
    const initObject = new Init();
    initObject.init();
};
