import { init } from './actions/init';
import { create } from './actions/create';

export const initAction = async () => {
    return init();
};

export const createAction = async (description: string) => {
    return create(description);
};
