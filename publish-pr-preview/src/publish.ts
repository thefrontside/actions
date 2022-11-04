import { colors, logIterable, LernaListOutputType } from "@frontside/actions-utils";
import { Operation } from "effection";
import { promises as fs } from "fs";
import path from "path";
import { attemptPublish } from "./attemptPublish";
import { npmView } from "./npmView";
import { AttemptedPackage, isPublishedPackage } from "./types";

interface PublishRun {
  packages: LernaListOutputType;
  branch: string
}

export interface PublishResults {
  tag: string;
  attemptedPackages: AttemptedPackage[]
}

export function* publish({ branch, packages }: PublishRun): Operation<PublishResults> {
  let tag = branch.replace(/\_/g, "-").replace(/\//g, "-");

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
      console.log(`${colors.yellow("Attempting to publish: ")} ${colors.blue(pkg.name)}`);

      try {
        let increaseFrom: string = yield npmView({ name: pkg.name, version: pkg.version, tag });
        let affected: string[] = yield changeAffectedDependencies(path.join(pkg.location, "package.json"), attemptedPackages);
        logIterable("  Updated dependencies: ", affected, "No dependencies were updated");

        let publishAttempt: {
          publishedVersion: string;
          attemptedVersions: string[];
        } = yield attemptPublish({ name: pkg.name, increaseFrom, tag, directory: pkg.location, attemptCount: 3 });

        attemptedPackages.set(pkg.name, {
          ...publishAttempt,
          ...pkg,
        });

      } catch (error) {
        console.error(colors.red(`Publishing ${pkg.name} failed due to error`));
        console.log(error);
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
