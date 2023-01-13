import { init } from './actions/init';
import { create } from './actions/create';
import { up } from './actions/up';
import { status } from './actions/status';
import { down } from './actions/down';

export const initAction = async () => {
    return init();
};

export const createAction = async (description: string, profile = 'default') => {
    return create(description, profile);
};

export const upAction = async (profile = 'default') => {
    return up(profile);
};

export const downAction = async (profile = 'default') => {
    return down(profile);
};

export const statusAction = async (profile = 'default') => {
    return status(profile);
};
