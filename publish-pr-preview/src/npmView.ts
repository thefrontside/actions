import { exec, Process, ProcessResult } from "@effection/process";
import { Operation, spawn } from "effection";
import semver from "semver";

export function* npmView({
  name, version, tag,
}: {
  name: string;
  version: string;
  tag: string;
}): Operation<string> {
  let newPackage: ProcessResult = yield exec(`npm view ${name}`).join();
  if (newPackage.code !== 0) {
    return version;
  } else {
    let versions: Process = yield exec(`npm view ${name} versions --json`);
    let stdoutVersions = "";

    yield spawn(versions.stdout.forEach(chars => {
      process.stdout.write(chars);
      stdoutVersions += chars;
    }));

    yield spawn(versions.stderr.forEach(chars => { process.stderr.write(chars) }));

    yield versions.expect();

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

    let maxSatisfying = semver.maxSatisfying(everyRelevantPublishedVersions, "^" + basePreviewVersion, { includePrerelease: true });

    return maxSatisfying || basePreviewVersion;
  }
}
