import { Operation } from "effection";
import { PackageTags } from ".";
export declare function removeTags({ allPackageTags, gitBranches, preserve, }: {
    allPackageTags: PackageTags[];
    gitBranches: string[];
    preserve: string[];
}): Operation<void>;
