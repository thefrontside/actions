import { exec, ProcessResult } from "@effection/process";
import { colors } from "@frontside/actions-utils";
import semver from "semver";

export function* attemptPublish({
  name, increaseFrom, tag, directory, attemptCount,
}: {
  name: string;
  increaseFrom: string;
  tag: string;
  directory: string;
  attemptCount: number;
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
