/* eslint-disable @typescript-eslint/no-var-requires */
const s = require("semver");

/*
  temporary unit tests because i think it might be easier to organize my notes in this format
*/

/*
semver notes
  ^1.2.0 is everything under 2.0.0
  ^0.1.2 is everything under 0.2.0
  latest is last published without tag, not necessarily highest
    this is not reliable when we have multiple versions in parallel (v1 and v2)

scenarios
  first preview on normal
    1.2.3 => 1.2.4-preview.0
    subsequent previews with no releases
      1.2.3 => 1.2.4-preview.1
    new patch release
      1.2.4 => 1.2.5-preview.0
      same for 0.2.4
        0.2.4 => 0.2.5-preview.0
    new minor release
      1.3.0 => 1.3.1-preview.0
      same for 0.3.0
        0.3.0 => 0.3.1-preview.0
    new major release
      irrelevant, get the highest minor version
  preview on prerelease
    1.2.3-beta.1 => 1.2.3-beta.1-preview.0

what is the current version
  is it prerelease?
npm view package versions --json
  to get all versions
npm view package@tag
  to get package@tag for interval if previous preview was published
*/

describe("correct preview versioning for all scenarios", () => {
  describe("semver inc function", () => {
    test("add preview tag to package version", () => {
      expect(s.inc("1.2.3", "prerelease", "branch")).toEqual("1.2.4-branch.0");
    });
    test("add preview tag to prerelease package version", () => {
      expect(s.inc("1.2.3-abc.2", "prerelease", "branch")).toEqual("1.2.3-branch.0");
    });
    test("bumping interval of preview version", () => {
      expect(s.inc("1.2.3-branch.0", "prerelease")).toEqual("1.2.3-branch.1");
    });
    test("bump interval of preview version with identifier specified", () => {
      expect(s.inc("1.2.3-branch.0", "prerelease", "branch")).toEqual("1.2.3-branch.1");
    });
  });
  describe("semver maxSatisfying function", () => {
    test("maxSatisfying cannot be used for fetching specific prerelease interval", () => {
      expect(s.maxSatisfying(
        ["1.2.3-branch.1", "1.2.4-otherBranch.0"],
        "^1.2.3-branch.0",
        { includePrerelease: true }
      )).not.toEqual("1.2.3-branch.1");
    });
    test("maxSatisfying recognizes prerelease is lower than regular semver", () => {
      expect(s.maxSatisfying(
        ["1.2.2", "1.2.3"],
        "^1.2.3-beta.1",
        { includePrerelease: true }
      )).toEqual("1.2.3");
    });
  });
});
