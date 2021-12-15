import s from "semver";
import expect from "expect";

const previewVersioning = ({
  current, // get from package.json
  npmView, // npm view pkg versions --json
  npmViewTag,
}:{
  current: string,
  npmView: string[],
  npmViewTag?: string,
}): string => {
  let npmViewTagWithoutVersionFlag = true;
  let currentPreviewVersion = npmViewTag && npmViewTagWithoutVersionFlag ? npmViewTag : current;
    // npm view pkg @ invalid tag will return npm version
      // therefore we need to do npm view pkg @ tag first, if it doesn't return anything, it means stick with package.json version
        // if it does return something we run npm view pkg @ tag again with --version to get the last published preview version
  let maxSat = s.maxSatisfying(npmView, "^"+currentPreviewVersion);
  let increaseFrom = maxSat || currentPreviewVersion;
  return s.inc(increaseFrom, "prerelease", "branch") || "";
};

describe("correct preview versioning for all scenarios", () => {
  describe("semver inc function", () => {
    it("add preview tag to package version", () => {
      expect(s.inc("1.2.3", "prerelease", "branch")).toEqual("1.2.4-branch.0");
    });

    it("add preview tag to prerelease package version", () => {
      expect(s.inc("1.2.3-abc.2", "prerelease", "branch")).toEqual("1.2.3-branch.0");
    });

    it("bumping interval of preview version", () => {
      expect(s.inc("1.2.3-branch.0", "prerelease")).toEqual("1.2.3-branch.1");
    });

    it("bump interval of preview version with identifier specified", () => {
      expect(s.inc("1.2.3-branch.0", "prerelease", "branch")).toEqual("1.2.3-branch.1");
    });
  });
  describe("semver maxSatisfying function", () => {
    it("maxSatisfying cannot be used for fetching specific prerelease interval", () => {
      expect(s.maxSatisfying(
        ["1.2.3-branch.1", "1.2.4-otherBranch.0"],
        "^1.2.3-branch.0",
        { includePrerelease: true }
      )).not.toEqual("1.2.3-branch.1");
    });

    it("maxSatisfying recognizes prerelease is lower than regular semver", () => {
      expect(s.maxSatisfying(
        ["1.2.2", "1.2.3"],
        "^1.2.3-beta.1"
      )).toEqual("1.2.3");
    });

    it("multiple maxSatisfying results still returns one", () => {
      expect(s.maxSatisfying(
        ["1.2.2", "1.2.3", "1.2.4"],
        "^1.2.1"
      )).toEqual("1.2.4");
    });

    it("maxSatisfying when version is above range", () => {
      expect(s.maxSatisfying(
        ["1.2.0"],
        "^1.2.1"
      )).toEqual(null);
    });
  });
  describe("steps of semver functions to cover all preview versioning scenarios", () => {
    describe("generating preview version from regular semver", () => {
      it("entering prerelease mode", () => {
        expect(previewVersioning({ current: "1.1.1", npmView: ["1.1.1"] })).toEqual("1.1.2-branch.0");
      });

      it("generating the next interval of a preview version", () => {
        expect(previewVersioning({ current: "1.1.1", npmView: ["1.1.1"], npmViewTag: "1.1.2-branch.2" })).toEqual("1.1.2-branch.3");
      });

      it("when patch is released before feature branch is rebased", () => {
        expect(previewVersioning({ current: "1.1.1", npmView: ["1.1.1", "1.1.2"] })).toEqual("1.1.3-branch.0");
      });

      it("when minor is released before feature branch is rebased", () => {
        expect(previewVersioning({ current: "1.1.1", npmView: ["1.1.1", "1.1.2", "1.2.0"] })).toEqual("1.2.1-branch.0");
      });

      it("when major is released it should not affect preview version", () => {
        expect(previewVersioning({ current: "1.1.1", npmView: ["1.1.1", "2.0.0"] })).toEqual("1.1.2-branch.0");
      });

      it("maxSatisfying should grab the highest patch if version is <1.0.0", () => {
        expect(previewVersioning({ current: "0.2.0", npmView: ["0.2.0", "0.2.1", "0.3.0"] })).toEqual("0.2.2-branch.0");
      });
    });
    describe("generating preview version from prerelease", () => {
      it("generating preview version from preexisting beta prerelease version", () => {
        expect(previewVersioning({ current: "1.1.1-beta.2", npmView: ["1.1.0", "1.1.1-beta.2"] })).toEqual("1.1.1-branch.0");
      });

      it("maxSatisfying when there are higher prerelease versions", () => {
        expect(previewVersioning({ current: "1.1.1-beta.2", npmView: ["1.1.0", "1.1.1-beta.2", "1.2.0-malicious.1"] })).toEqual("1.1.1-branch.0");
      });
    });
  });
});
