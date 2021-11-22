import * as core from "@actions/core";
import * as github from "@actions/github";
import fs from "fs";
import { main } from "effection";
import { run } from "./src";

const token =
  core.getInput("token") === ""
    ? process.env.GITHUB_TOKEN || ""
    : core.getInput("token");
const octokit = github.getOctokit(token);

const payload = JSON.parse(fs.readFileSync(`${process.env.GITHUB_EVENT_PATH}`, "utf-8"));

main(  
  run({ octokit, payload })
);
