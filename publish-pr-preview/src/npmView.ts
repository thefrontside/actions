import { exec, ProcessResult } from "@effection/process";
import { colors } from "@frontside/actions-utils";
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
    let basePreviewVersion = version;

    try {
    let { stdout: previouslyPublishedPreview }: ProcessResult = yield exec(`npm view ${name}@${tag}`).expect();
    let { stdout: previousPreviewVersion }: ProcessResult = yield exec(`npm view ${name}@${tag} version`).expect();

    basePreviewVersion = previouslyPublishedPreview
      ? previousPreviewVersion
      : version;
    } catch (error) {
      console.warn(colors.yellow(`Failed to view package version of ${name}@${tag} with error`), error)
    }

    let maxSatisfying = semver.maxSatisfying(everyRelevantPublishedVersions, "^" + basePreviewVersion, { includePrerelease: true });

    return maxSatisfying || basePreviewVersion;
  }
}
