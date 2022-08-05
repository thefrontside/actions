import { exec, ProcessResult } from "@effection/process";
import { Operation } from "effection";
import { z } from "zod";

const LernaListOutput = z.array(z.object({
  name: z.string(),
  version: z.string(),
  private: z.boolean(),
  location: z.string(),
}));

export type LernaListOutputType = z.TypeOf<typeof LernaListOutput>

export function* detectAffectedPackages({ baseRef }: { baseRef: string; }): Operation<LernaListOutputType> {
  yield exec(`git checkout ${baseRef} && git checkout -`, { shell: true }).expect();

  let affectedPackages: ProcessResult = yield exec(`npx lerna ls --since ${baseRef} --toposort --json`).join();
  console.log(affectedPackages.stdout);
  if (affectedPackages.code !== 0) {
    console.error(affectedPackages.stderr);
    throw new Error("Failed to retrieve affected packages.");
  }
  return LernaListOutput.parse(JSON.parse(affectedPackages.stdout));
}
