import * as core from "@actions/core";
import * as github from "@actions/github";
import fs from "fs";
import { main } from "effection";
import { run } from "./src";

// TODO we don't have token input so just do `process... || ""`
const token =
  core.getInput("token") === ""
    ? process.env.GITHUB_TOKEN || ""
    : core.getInput("token");
const octokit = github.getOctokit(token);

const payload = JSON.parse(fs.readFileSync(`${process.env.GITHUB_EVENT_PATH}`, "utf-8"));

main(
  run({
    octokit,
    core,
    payload,
  })
);
