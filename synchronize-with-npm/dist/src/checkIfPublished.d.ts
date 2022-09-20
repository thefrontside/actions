import { Operation } from "effection";
import { PackageInfo } from "./listPackages";
export interface PublishCheck {
    publish: PackageInfo[];
    skip: PackageInfo[];
}
export declare function checkIfPublished(pkgsToCheck: PackageInfo[]): Operation<PublishCheck>;
