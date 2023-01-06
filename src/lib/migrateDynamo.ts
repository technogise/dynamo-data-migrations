import { init } from './actions/init';
import { create } from './actions/create';
import { up } from './actions/up';
import { status } from './actions/status';
import { down } from './actions/down';

export const initAction = async () => {
    return init();
};

export const createAction = async (description: string) => {
    return create(description);
};

export const upAction = async () => {
    return up();
};

export const downAction = async () => {
    return down();
};

export const statusAction = async () => {
    return status();
};
