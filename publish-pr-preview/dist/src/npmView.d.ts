import { ProcessResult } from "@effection/process";
export declare function npmView({ name, version, tag, }: {
    name: string;
    version: string;
    tag: string;
}): Generator<import("effection").Operation<ProcessResult>, any, ProcessResult>;
