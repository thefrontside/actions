import { describe, it, beforeEach } from "@effection/mocha";
import { exec } from "@effection/process";
import fs, { promises as fsp } from "fs";
import expect from "expect";
import { fixturePackageJson } from "./utils";

describe("exec with cwd for npm commands", () => {
  beforeEach(function* () {
    if (fs.existsSync(`${__dirname}/fixtures`)) {
      yield exec("rm -rf fixtures", { cwd: __dirname }).expect();
    }
    yield function* () {
      yield fsp.mkdir(`${__dirname}/fixtures`);
      yield fsp.mkdir(`${__dirname}/fixtures/pkg-a`);
      yield fsp.mkdir(`${__dirname}/fixtures/pkg-b`);
      yield fsp.appendFile(
        `${__dirname}/fixtures/pkg-a/package.json`,
        fixturePackageJson({ pkgName: "pkg-a" })
      );
      yield fsp.appendFile(
        `${__dirname}/fixtures/pkg-b/package.json`,
        fixturePackageJson({ pkgName: "pkg-b" })
      );
    };
  });

  it("exec npm view in fixtures", function* () {
    yield exec(
      "npm version 1.0.0 --no-git-tag-version",
      { cwd: `${__dirname}/fixtures/pkg-a` }
    ).expect();
    yield exec(
      "npm version 2.0.0 --no-git-tag-version",
      { cwd: `${__dirname}/fixtures/pkg-b` }
    ).expect();
    let pkgA = JSON.parse(
      fs.readFileSync(`${__dirname}/fixtures/pkg-a/package.json`, { encoding: "utf-8" })
    );
    let pkgB = JSON.parse(
      fs.readFileSync(`${__dirname}/fixtures/pkg-b/package.json`, { encoding: "utf-8" })
    );
    expect(pkgA.version).toBe("1.0.0");
    expect(pkgB.version).toBe("2.0.0");
  });
});
