import { describe, it } from "@effection/mocha";
import { exec } from "@effection/process";
import expect from "expect";
import s from "semver";

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
  it("npm view versions", function* () {
    // npm view pkg versions --json
      // json clips the first and last \n and outputs one version per line
      // non-json outputs 4 version per line
    let npmViewVersions = yield exec("npm view bigtest versions --json");
    let parsed = JSON.parse(yield npmViewVersions.stdout.text().expect());
    expect(Array.isArray(parsed)).toBeTruthy();
  });
});
