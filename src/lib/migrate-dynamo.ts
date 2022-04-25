import init from './actions/init';
import create from './actions/create';

var initAction = function () {
    new init();
};

var createAction = function (description: string) {
    new create(description);
};

export { initAction, createAction };
