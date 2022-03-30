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
  let tag = "branch";
  let npmViewTagWithoutVersionFlag = true;
  let currentPreviewVersion = npmViewTag && npmViewTagWithoutVersionFlag ? npmViewTag : current;
  let filteredNpmView = npmView.filter((version: string) => {
    let prerelease = s.prerelease(version);
    return prerelease && prerelease[0] == tag || !prerelease;
  });
  let maxSat = s.maxSatisfying(filteredNpmView, "^"+currentPreviewVersion, { includePrerelease: true });
  let increaseFrom = maxSat || currentPreviewVersion;
  return s.inc(increaseFrom, "prerelease", tag) || "";
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
    describe("maxSatisfying includePrerelease option", () => {
      it("maxSatisfying will not match prerelease tag and will return the highest one alphabetically", () => {
        expect(s.maxSatisfying(
          ["1.2.3-aaa.4", "1.2.3-bbb.0"],
          "^1.2.3-aaa.1",
          { includePrerelease: true }
        )).toEqual("1.2.3-bbb.0");
      });
      it("maxSatisfying will correctly return prerelease when option is set", () => {
        expect(s.maxSatisfying(
          ["1.0.0", "1.0.1", "1.1.0-abc.1", "1.1.0-abc.2"],
          "^1.0.0",
          { includePrerelease: true }
        )).toEqual("1.1.0-abc.2");
      });
      it("maxSatisfying will correctly not return prerelease when option is not set", () => {
        expect(s.maxSatisfying(
          ["1.0.0", "1.0.1", "1.1.0-abc.1"],
          "^1.0.0",
        )).toEqual("1.0.1");
        expect(s.maxSatisfying(
          ["1.0.0", "1.0.3", "1.0.4-abc.3"],
          "^1.0.0-abc.1"
        )).toEqual("1.0.3");
      });
      it("maxSatisfying will return highest prerelease without the option if there are no valid versions to fall back on", () => {
        expect(s.maxSatisfying(
          ["0.0.1", "1.0.0-abc.1", "1.0.0-x.2"],
          "^1.0.0-a.1"
        )).toEqual("1.0.0-x.2");
      });
    });

    it("maxSatisfying recognizes prerelease is lower than regular semver", () => {
      expect(s.maxSatisfying(
        ["1.2.2", "1.2.3"],
        "^1.2.3-beta.1",
        { includePrerelease: true }
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

      it("maxSatisfying when there are higher prerelease versions (when there shouldn't be)", () => {
        expect(previewVersioning({ current: "1.1.1-beta.2", npmView: ["1.1.0", "1.1.1-beta.2", "1.2.0-malicious.1"] })).toEqual("1.1.1-branch.0");
      });
    });
  });
});
