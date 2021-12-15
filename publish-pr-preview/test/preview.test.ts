import { describe, it, beforeEach } from "@effection/mocha";
import expect from "expect";
import { run } from "../src";

/*
  todos
    - [ ] how to mock npm
    - [ ] run action with fail cases: prerequisite might be pointless because we might get an error for mismatched payload before action runs
*/

describe("preview action", () => {
  describe("invalid scenarios", () => {
    it("fails when action is run on a non pull request", function* () {
      // github.context.payload does not have pull_request property
      
      let result = process.env;
      // let result = yield run({ octokit, core, payload });
      expect(result).toBe("doodoo");
    })
    describe("fails when action is run from a forked repository", () => {
      beforeEach(function* () {
        // github.context.payload.pr baseurl and headurl are different
      })
    })
    describe("fails when head branch is called latest", () => {
      beforeEach(function* () {
        // payload headbranch is "latest"
      })
    })
    describe("fails when checkout action is not configured to grab all commits", () => {
      beforeEach(function* () {
        // payload
      })
    })
  })
  describe("when there are no preview packages to publish", () => {
    it("posts github comment to pull request to say there were preview packages published")
  })
  describe("when there are preview packages to publish", () => {
    it("publishes all package jsons")
    it("skips private packages")
    it("does not publish the same packages twice")
    it("uses user-specified install script")
    it("applies correct preview version to packages")
    it("applies npm tags to packages")
    it("posts github comment to pull request")
  })
  describe("when multiple workflows run at the same time", () => {
    it("attempts 3 publishes with increments")
  })
  describe("when multiple workflows run at the same time and fails after 3 attempts", () => {
    it("posts github comment with publish-attempted package in table with warning message")
  })
})
