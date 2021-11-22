import { Operation } from "effection";
import { PackageTags } from ".";
export declare function getTagsForEachPackage({ publicPackages }: {
    publicPackages: string[];
}): Operation<PackageTags[]>;
