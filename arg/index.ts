import { main, Operation } from "effection";
import { exec } from "@effection/process";
import * as core from "@actions/core";

main(
  function*(): Operation<void> {
    let command = core.getInput("HELLO_BYE") || "yarn uhoh";
    yield exec(command).join();
  }
);
