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

export const upAction = async (profile: string) => {
    return up(profile);
};

export const downAction = async (profile: string, downShift: number) => {
    return down(profile, downShift);
};

export const statusAction = async (profile: string) => {
    return status(profile);
};
