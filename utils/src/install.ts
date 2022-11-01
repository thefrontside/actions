import type { Operation } from "effection";
import { colors } from "@frontside/actions-utils";
import { exec, Process } from "@effection/process";
import { spawn } from "effection";
import { promises as fs, Stats } from "fs";

type IntallParams = {
  installScript: string;
};

export function* install({ installScript }: IntallParams): Operation<void> {
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
    "::group::",
    colors.yellow("Installing with command "),
    colors.blue(installCommand) + colors.yellow(" ...\n"),
  );

  let install: Process = yield exec(installCommand, { shell: true }).join();
  yield spawn(install.stdout.forEach(chars => { process.stdout.write(chars) }));
  yield spawn(install.stderr.forEach(chars => { process.stderr.write(chars) }));
  yield install.expect();

  console.log("::endgroup::");
}
