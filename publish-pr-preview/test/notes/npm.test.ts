import { describe, it, beforeEach } from "@effection/mocha";
import { exec } from "@effection/process";
import fs, { promises as fsp } from "fs";
import expect from "expect";
import s from "semver";
import { fixturePackageJson } from "./utils";

describe("npm with effection", () => {
  it("npm view with version flag", function* () {
    let npmViewVersion = yield exec("npm view bigtest version");
    let result = yield npmViewVersion.stdout.lines().expect();
    let valid = s.valid(result);
    expect(valid).not.toEqual(null);
  });

  it("npm view with invalid tag", function* () {
    // invalid tag does not fail, it just responds with nothing
      // i am assuming we don't and probably won't ever have a branch called "doodoo123" in bigtest
    let npmView = yield exec("npm view bigtest@doodoo123").expect();
    expect(npmView.stdout).toEqual("");
  });

  it("npm view with valid tag", function* () {
    let npmView = yield exec("npm view bigtest@latest").expect();
    expect(npmView.stdout).not.toEqual("");
  });

  it("npm view versions --json", function* () {
    // npm view pkg versions --json
      // json clips the first and last \n and outputs one version per line
      // non-json outputs 4 version per line
    let npmViewVersions = yield exec("npm view bigtest versions --json");
    let parsed = JSON.parse(yield npmViewVersions.stdout.text().expect());
    let { stdout } = yield exec("npm view bigtest versions --json").expect();
    let stdoutParsed = JSON.parse(stdout);
    expect(stdoutParsed).toEqual(parsed);
    expect(Array.isArray(parsed)).toBeTruthy();
  });

  describe("npm error code confirmations", () => {
    beforeEach(function* () {
      if (fs.existsSync(`${__dirname}/fixtures`)) {
        yield exec("rm -rf fixtures", { cwd: __dirname }).expect();
      }
      yield fsp.mkdir(`${__dirname}/fixtures`);
      yield fsp.mkdir(`${__dirname}/fixtures/pkg-c`);
      yield fsp.appendFile(
        `${__dirname}/fixtures/pkg-c/package.json`,
        fixturePackageJson({ pkgName: "@minkimcello/georgia", pkgVersion: "1.10.33", privatePkg: false })
      );
    });

    it("npm publish pre-existing version", function* () {
      let publish = yield exec("npm publish", { cwd: `${__dirname}/fixtures/pkg-c` }).join();
      expect(publish.code).toEqual(1);
    });

    it("package does not exist yet on npm", function* () {
      let npmViewNonExistantPackage = yield exec ("npm view @minkimcello/12345").join();
      expect(npmViewNonExistantPackage.code).toEqual(1);
    });
  });
});
