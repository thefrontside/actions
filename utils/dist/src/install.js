"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = void 0;
const actions_utils_1 = require("@frontside/actions-utils");
const process_1 = require("@effection/process");
const effection_1 = require("effection");
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
    console.log("::group::", actions_utils_1.colors.yellow("Installing with command "), actions_utils_1.colors.blue(installCommand) + actions_utils_1.colors.yellow(" ...\n"));
    let install = yield process_1.exec(installCommand, { shell: true }).join();
    yield effection_1.spawn(install.stdout.forEach(chars => { process.stdout.write(chars); }));
    yield effection_1.spawn(install.stderr.forEach(chars => { process.stderr.write(chars); }));
    yield install.expect();
    console.log("::endgroup::");
}
exports.install = install;
//# sourceMappingURL=install.js.map