import { init } from './actions/init';
import { create } from './actions/create';

export const initAction = () => {
    init();
};

export const createAction = (description: string) => {
    create(description);
};
