"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ansiColors = void 0;
const ansi = (code) => `\x1b[${code}m`;
const nc = ansi("0");
const red = ansi("31");
const yellow = ansi("93");
const green = ansi("32");
const blue = ansi("34");
const purple = ansi("35");
const white = ansi("37");
const ansiColors = {
    red: (text) => {
        return red + text + nc;
    },
    yellow: (text) => {
        return yellow + text + nc;
    },
    green: (text) => {
        return green + text + nc;
    },
    blue: (text) => {
        return blue + text + nc;
    },
    purple: (text) => {
        return purple + text + nc;
    },
    white: (text) => {
        return white + text + nc;
    },
};
exports.ansiColors = ansiColors;
//# sourceMappingURL=ansiColors.js.map