"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = void 0;
const actions_utils_1 = require("@frontside/actions-utils");
const process_1 = require("@effection/process");
const fs_1 = require("fs");
function* install({ installScript }) {
    let installCommand = "npm ci";
    if (installScript) {
        installCommand = installScript;
    }
    else {
        let stat = yield fs_1.promises.stat("yarn.lock");
        if (stat.isFile()) {
            installCommand = "yarn install --frozen-lockfile";
        }
    }
    console.log(actions_utils_1.colors.yellow("Installing with command"), actions_utils_1.colors.blue(installCommand) + actions_utils_1.colors.yellow("...\n"));
    let install = yield process_1.exec(installCommand, { shell: true }).join();
    console.log(install.stdout);
    if (install.code !== 0) {
        console.error(install.stderr);
        throw new Error(`Failed command (${install.code}): ${installCommand}`);
    }
}
exports.install = install;
//# sourceMappingURL=install.js.map