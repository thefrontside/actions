"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logIterable = void 0;
const ansiColors_1 = require("./ansiColors");
function logIterable(description, iterable, emptyDescription) {
    if (iterable.length) {
        console.log(ansiColors_1.ansiColors.yellow(description));
        iterable.forEach(i => console.log("  " + ansiColors_1.ansiColors.blue(i)));
        console.log("");
    }
    else {
        emptyDescription && console.log(ansiColors_1.ansiColors.purple(emptyDescription + "\n"));
    }
}
exports.logIterable = logIterable;
//# sourceMappingURL=logIterable.js.map