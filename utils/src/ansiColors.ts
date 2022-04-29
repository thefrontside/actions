const ansi = (code: string) => `\x1b[${code}m`;

const nc = ansi("0");

const red = ansi("31");
const yellow = ansi("93");
const green = ansi("32");
const blue = ansi("34");
const purple = ansi("35");
const white = ansi("37");

const ansiColors = {
  red: (text: string): string => {
    return red+text+nc;
  },
  yellow: (text: string): string => {
    return yellow+text+nc;
  },
  green: (text: string): string => {
    return green+text+nc;
  },
  blue: (text: string): string => {
    return blue+text+nc;
  },
  purple: (text: string): string => {
    return purple+text+nc;
  },
  white: (text: string): string => {
    return white+text+nc;
  },
};

export { ansiColors };
