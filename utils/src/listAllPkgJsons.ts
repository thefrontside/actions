import glob from "glob";

export function listAllPkgJsons (directory: string = "."): Array<string> {
  return glob.sync("**/package.json", {
    cwd: directory,
    ignore: ["**/node_modules/**"],
  });
}
