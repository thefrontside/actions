import { exec, ProcessResult } from "@effection/process";
import { colors, logIterable } from "@frontside/actions-utils";
import { Operation } from "effection";
import { promises as fs, Stats } from "fs";
import path from "path";
import { stderr, stdout } from "process";
import { attemptPublish } from "./attemptPublish";
import { npmView } from "./npmView";
import { AttemptedPackage, isPublishedPackage, LernaListOutput } from "./types";

interface PublishRun {
  installScript: string;
  baseRef: string;
  branch: string
}

export interface PublishResults {
  tag: string;
  attemptedPackages: AttemptedPackage[]
}

export function* publish({ installScript, branch, baseRef }: PublishRun): Operation<PublishResults> {
  let installCommand = "npm ci";
  if (installScript) {
    installCommand = installScript;
  } else {
    let stat: Stats = yield fs.stat("yarn.lock");
    if (stat.isFile()) {
      installCommand = "yarn install --frozen-lockfile";
    }
  }

  let tag = branch.replace(/\_/g, "-").replace(/\//g, "-");

  console.log(
    colors.yellow("Installing with command"),
    colors.blue(installCommand)+colors.yellow("...\n"),
  );

  let install: ProcessResult = yield exec(installCommand).join();
  if (install.code !== 0) {
    console.log(install.stdout);
    console.error(install.stderr);
    throw new Error(`Failed command (${install.code}): ${installCommand}`);
  }

  let affectedPackages: ProcessResult = yield exec(`npx lerna ls --since ${baseRef} --toposort --json`).join();
  if (affectedPackages.code !== 0) {
    console.log(affectedPackages.stdout);
    console.error(affectedPackages.stderr);
    throw new Error("Failed to retrieve affected packages.");
  }

  let packages = LernaListOutput.parse(`${affectedPackages.stdout}`);

  console.log(colors.yellow("Publishing packages...\n"));

  logIterable(
    "The following packages will be skipped because they are marked private:",
    packages
      .filter(pkg => pkg.private)
      .map(pkg => pkg.name)
  );

  let attemptedPackages: Map<string, AttemptedPackage> = new Map();

  for (let pkg of packages) {
    if (!pkg.private) {
      console.log(colors.yellow("Attempting to publish: "), colors.blue(pkg.name));

      try {
        let increaseFrom: string = yield npmView({ name: pkg.name, version: pkg.version, tag });
        let affected = yield changeAffectedDependencies(path.join(pkg.location, "package.json"), attemptedPackages)
        if (affected.length > 0) {
          console.log(colors.yellow("Updated dependencies: "), colors.blue(affected.join(", ")));
        } else {
          console.log(colors.yellow("No dependencies were updated"));
        }

        let publishAttempt: {
          publishedVersion: string;
          attemptedVersions: string[];
        } = yield attemptPublish({ name: pkg.name, increaseFrom, tag, directory: pkg.location, attemptCount: 3 });

        attemptedPackages.set(pkg.name, {
          ...publishAttempt,
          ...pkg,
        });

      } catch (error) {
        attemptedPackages.set(pkg.name, {
          ...pkg,
          error,
        });
      }
    }
  }

  let result = {
    tag,
    attemptedPackages: [...attemptedPackages.values()],
  };

  logIterable(
    "The following preview packages were published:",
    result.attemptedPackages
      .flatMap((pkg) => isPublishedPackage(pkg) ? [`${colors.blue(pkg.name) + colors.yellow("@") + colors.blue(pkg.publishedVersion)}`] : []),
    "This workflow run did not publish any preview packages"
  );

  return result;
}

function* changeAffectedDependencies(location: string, attemptedPackages: Map<string, AttemptedPackage>) {
  let packageJson: string = yield fs.readFile(location, { encoding: "utf-8" });
  let packageJsonContent = JSON.parse(packageJson) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };

  let madeChanges: string[] = [];

  function updateDependencies(dependencies: Record<string, string>) {
    for (let name in dependencies) {
      if (attemptedPackages.has(name)) {
        let pkg = attemptedPackages.get(name);
        if (pkg && isPublishedPackage(pkg)) {
          dependencies[name] = pkg.publishedVersion;
          madeChanges.push(name);
        }
      }
    }
  }

  if (packageJsonContent.dependencies) {
    updateDependencies(packageJsonContent.dependencies);
  }

  if (packageJsonContent.devDependencies) {
    updateDependencies(packageJsonContent.devDependencies);
  }

  if (madeChanges.length > 0) {
    yield fs.writeFile(location, JSON.stringify(packageJsonContent));
  }

  return madeChanges;
}
