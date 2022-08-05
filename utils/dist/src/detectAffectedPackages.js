"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectAffectedPackages = void 0;
const process_1 = require("@effection/process");
const zod_1 = require("zod");
const LernaListOutput = zod_1.z.array(zod_1.z.object({
    name: zod_1.z.string(),
    version: zod_1.z.string(),
    private: zod_1.z.boolean(),
    location: zod_1.z.string(),
}));
function* detectAffectedPackages({ baseRef }) {
    yield process_1.exec(`git checkout ${baseRef} && git checkout -`, { shell: true }).expect();
    let affectedPackages = yield process_1.exec(`npx lerna ls --since ${baseRef} --toposort --json`).join();
    console.log(affectedPackages.stdout);
    if (affectedPackages.code !== 0) {
        console.error(affectedPackages.stderr);
        throw new Error("Failed to retrieve affected packages.");
    }
    return LernaListOutput.parse(JSON.parse(affectedPackages.stdout));
}
exports.detectAffectedPackages = detectAffectedPackages;
//# sourceMappingURL=detectAffectedPackages.js.map