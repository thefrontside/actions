import { exec, ProcessResult } from "@effection/process";
import { Operation } from "effection";
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
    let { stdout: stdoutVersions }: ProcessResult = yield exec(`npm view ${name} versions --json`).expect();
    let versionsParsed = JSON.parse(stdoutVersions);
    let versionsArray = Array.isArray(versionsParsed) && versionsParsed || [versionsParsed];
    let everyRelevantPublishedVersions = versionsArray.filter((version: string) => {
      let prerelease = semver.prerelease(version);
      return prerelease && prerelease[0] == tag || !prerelease;
    });
    let { stdout: packagePublishedTags }: ProcessResult = yield exec(`npm dist-tag ${name}`).expect();

    let tagsVersionsMap = new Map(packagePublishedTags.split("\n").map(line => line.trim().split(": ") as [string, string]));

    let basePreviewVersion = tagsVersionsMap.get(tag) ?? version;

    let maxSatisfying = semver.maxSatisfying(everyRelevantPublishedVersions, "^" + basePreviewVersion, { includePrerelease: true });

    return maxSatisfying || basePreviewVersion;
  }
}
