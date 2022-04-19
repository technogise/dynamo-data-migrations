"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
class init {
    constructor() {
        this.copyFile = function (src, dest) {
            try {
                fs_extra_1.default.copySync(src, dest);
                console.log('Initialization successful. Please edit the generated config.js file');
            }
            catch (err) {
                console.error(err);
            }
        };
    }
    init() {
        this.copyFile('./node_modules/dynamo-data-migrations/src/samples', './migrations');
    }
}
exports.default = init;
