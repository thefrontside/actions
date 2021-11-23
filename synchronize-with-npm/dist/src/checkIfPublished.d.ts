import { Operation } from "effection";
import { ToPublish } from "./listPackages";
export declare function checkIfPublished({ pkgsToPublish }: {
    pkgsToPublish: ToPublish[];
}): Operation<ToPublish[]>;
