/// <reference types="node" />
import { ProcessResult } from "@effection/process";
import { Stats } from "fs";
declare type IntallParams = {
    installScript: string;
};
export declare function install({ installScript }: IntallParams): Generator<Promise<Stats> | import("effection").Operation<ProcessResult>, void, Stats & ProcessResult>;
export {};
