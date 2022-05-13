import { init } from './actions/init';
import { create } from './actions/create';

var initAction = function () {
    init();
};

var createAction = function (description: string) {
    create(description);
};

export { initAction, createAction };
