import { colors } from "@frontside/actions-utils";
import { exec, ProcessResult } from "@effection/process";
import { promises as fs, Stats } from "fs";


type IntallParams = {
  installScript: string;
};

export function* install({ installScript }: IntallParams) {
  let installCommand = "npm ci";
  if (installScript) {
    installCommand = installScript;
  } else {
    let stat: Stats = yield fs.stat("yarn.lock");
    if (stat.isFile()) {
      installCommand = "yarn install --frozen-lockfile";
    }
  }

  console.log(
    colors.yellow("Installing with command"),
    colors.blue(installCommand) + colors.yellow("...\n"),
  );

  let install: ProcessResult = yield exec(installCommand, { shell: true }).join();
  console.log(install.stdout);
  if (install.code !== 0) {
    console.error(install.stderr);
    throw new Error(`Failed command (${install.code}): ${installCommand}`);
  }
}
