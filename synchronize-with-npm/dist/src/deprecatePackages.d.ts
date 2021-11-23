import { Operation } from "effection";
import { ToDeprecate } from "./listPackages";
export declare function deprecatePackages({ pkgsToDeprecate }: {
    pkgsToDeprecate: ToDeprecate[];
}): Operation<string[]>;
