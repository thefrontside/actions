import * as core from "@actions/core";
import * as github from "@actions/github";
import fs from "fs";
import { main } from "effection";
import { run } from "./src";

const token = process.env.GITHUB_TOKEN || "";
const octokit = github.getOctokit(token);

const payload = JSON.parse(fs.readFileSync(`${process.env.GITHUB_EVENT_PATH}`, "utf-8"));

const defaultProtectedTags = ["alpha", "beta", "latest", "dev"];
const preserve = core.getInput("PRESERVE")
  ? core.getInput("PRESERVE").split(" ").concat(...defaultProtectedTags)
  : defaultProtectedTags;

main(  
  run({ octokit, payload, preserve })
);
