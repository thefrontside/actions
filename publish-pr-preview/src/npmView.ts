import { exec, ProcessResult } from "@effection/process";
import semver from "semver";

export function* npmView({
  name, version, tag,
}: {
  name: string;
  version: string;
  tag: string;
}) {
  let newPackage: ProcessResult = yield exec(`npm view ${name}`).join();
  console.dir(newPackage, { depth: 3 });
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

    let { stdout: previouslyPublishedPreview }: ProcessResult = yield exec(`npm view ${name}@${tag}`).expect();
    let { stdout: previousPreviewVersion }: ProcessResult = yield exec(`npm view ${name}@${tag} version`).expect();

    let basePreviewVersion = previouslyPublishedPreview
      ? previousPreviewVersion
      : version;

    let maxSatisfying = semver.maxSatisfying(everyRelevantPublishedVersions, "^" + basePreviewVersion, { includePrerelease: true });

    return maxSatisfying || basePreviewVersion;
  }
}
