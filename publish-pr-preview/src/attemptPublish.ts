import { exec, Process, ProcessResult } from "@effection/process";
import { colors } from "@frontside/actions-utils";
import { Operation, spawn } from "effection";
import semver from "semver";

export function* attemptPublish({
  name, increaseFrom, tag, directory, attemptCount,
}: {
  name: string;
  increaseFrom: string;
  tag: string;
  directory: string;
  attemptCount: number;
}): Operation<{ atteptedVersions: string[] }> {
  let bumpVersion = (version: string, tag: string) => semver.inc(version, "prerelease", tag) || "";
  let attemptedVersions: string[] = [];
  while (attemptCount > 0) {
    increaseFrom = bumpVersion(increaseFrom, tag);

    let cmd = `npm version ${increaseFrom} --no-git-tag-version`;
    yield exec(cmd, { cwd: directory }).join();

    console.log(
      `${colors.yellow("  Attempting to publish")} ${colors.blue(increaseFrom)} ${colors.yellow("of")} ${colors.blue(name)}} ${colors.yellow("...")}`
    );

    let publishAttempt: Process = yield exec(`npm publish --access=public --tag=${tag}`, { cwd: directory });
    yield spawn(publishAttempt.stdout.forEach(chars => { process.stdout.write(chars) }));
    yield spawn(publishAttempt.stderr.forEach(chars => { process.stderr.write(chars) }));
    try {
      yield publishAttempt.expect();
      return {
        publishedVersion: increaseFrom,
      };
    } catch (e) {
      attemptedVersions = [...attemptedVersions, increaseFrom];
      attemptCount--;
    }
  }

  console.log(colors.red(`  Publish failed after ${attemptedVersions.length} attempts`));

  return {
    attemptedVersions,
  };
}
