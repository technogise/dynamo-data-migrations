"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAction = void 0;
const init_1 = __importDefault(require("./actions/init"));
var initAction = function () {
    const initaction = new init_1.default();
    initaction.init();
};
exports.initAction = initAction;
