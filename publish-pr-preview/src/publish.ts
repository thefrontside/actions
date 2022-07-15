import { exec, ProcessResult } from "@effection/process";
import { Operation } from "effection";
import fs from "fs";
import semver from "semver";
import { colors, logIterable } from "@frontside/actions-utils";
import { AttemptedPackage, isPublishedPackage, LernaListOutputType } from "./types";
import { stderr, stdout } from "process";

interface PublishRun {
  packages: LernaListOutputType;
  installScript: string;
  branch: string
}

export interface PublishResults {
  tag: string;
  attemptedPackages: AttemptedPackage[]
}

export function* publish({ packages, installScript, branch }: PublishRun): Operation<PublishResults> {
  let installCommand = installScript || fs.existsSync("yarn.lock") ? "yarn install --frozen-lockfile" : "npm ci";
  let tag = branch.replace(/\_/g, "-").replace(/\//g, "-");

  console.log(
    colors.yellow("Installing with command"),
    colors.blue(installCommand)+colors.yellow("...\n"),
  );

  let install: ProcessResult = yield exec(installCommand).join();
  if (install.code !== 0) {
    console.log(stdout);
    console.error(stderr);
    throw new Error(`Failed command: ${installCommand}`);
  }

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

function* attemptPublish ({
  name,
  increaseFrom,
  tag,
  directory,
  attemptCount,
}:{
  name: string,
  increaseFrom: string,
  tag: string,
  directory: string,
  attemptCount: number,
}) {
  let bumpVersion = (version: string, tag: string) => semver.inc(version, "prerelease", tag) || "";
  let attemptedVersions: string[] = [];
  while (attemptCount > 0) {
    increaseFrom = bumpVersion(increaseFrom, tag);

    let cmd = `npm version ${increaseFrom} --no-git-tag-version`;
    let version: ProcessResult = yield exec(cmd, { cwd: directory }).join();
    console.log(`${version.stdout}`);
    if (version.code !== 0) {
      console.error(`${version.stderr}`);
      throw new Error(`Failed to set the new version number with "${cmd}"`);
    }

    console.log(
      colors.yellow("  Attempting to publish"),
      colors.blue(increaseFrom),
      colors.yellow("of"),
      colors.blue(name),
      colors.yellow("...")
    );
    let publishAttempt: ProcessResult = yield exec(`npm publish --access=public --tag=${tag}`, { cwd: directory }).join();

    if (publishAttempt.code === 0) {
      return {
        publishedVersion: increaseFrom,
      };
    }
    attemptedVersions = [...attemptedVersions, increaseFrom];
    attemptCount--;
  }
  return {
    attemptedVersions,
  };
}

function* npmView ({
  name,
  version,
  tag,
}:{
  name: string,
  version: string,
  tag: string,
}) {
  let newPackage: ProcessResult = yield exec(`npm view ${name}`).join();
  if (newPackage.code === 1) {
    return version;
  } else {
    let { stdout: stdoutVersions }: ProcessResult = yield exec(`npm view ${name} versions --json`).expect();
    let versionsParsed = JSON.parse(stdoutVersions);
    let versionsArray = Array.isArray(versionsParsed) && versionsParsed || [versionsParsed];
    let everyRelevantPublishedVersions = versionsArray.filter((version: string) => {
      let prerelease = semver.prerelease(version);
      return prerelease && prerelease[0] == tag || !prerelease;
    });

    let { stdout: previouslyPublishedPreview }: ProcessResult = yield exec(`npm view ${name}@${tag}`).expect();
    let { stdout: previousPreviewVersion }: ProcessResult = yield exec(`npm view ${name}@${tag} version`).expect();

    let basePreviewVersion = previouslyPublishedPreview
      ? previousPreviewVersion
      : version;

    let maxSatisfying = semver.maxSatisfying(everyRelevantPublishedVersions, "^"+basePreviewVersion, { includePrerelease: true });

    return maxSatisfying || basePreviewVersion;
  }
}
