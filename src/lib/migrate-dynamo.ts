import init from './actions/init';

var initAction = function () {
    const initaction = new init();
    initaction.init();
};

export { initAction };
