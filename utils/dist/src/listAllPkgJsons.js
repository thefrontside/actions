"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAllPkgJsons = void 0;
const glob_1 = __importDefault(require("glob"));
function listAllPkgJsons(directory = ".") {
    return glob_1.default.sync("**/package.json", {
        cwd: directory,
        ignore: ["**/node_modules/**"],
    });
}
exports.listAllPkgJsons = listAllPkgJsons;
//# sourceMappingURL=listAllPkgJsons.js.map