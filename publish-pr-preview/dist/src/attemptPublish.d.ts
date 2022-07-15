import { ProcessResult } from "@effection/process";
export declare function attemptPublish({ name, increaseFrom, tag, directory, attemptCount, }: {
    name: string;
    increaseFrom: string;
    tag: string;
    directory: string;
    attemptCount: number;
}): Generator<import("effection").Operation<ProcessResult>, {
    publishedVersion: string;
    attemptedVersions?: undefined;
} | {
    attemptedVersions: string[];
    publishedVersion?: undefined;
}, ProcessResult>;
