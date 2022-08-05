import { Operation } from "effection";
export declare function attemptPublish({ name, increaseFrom, tag, directory, attemptCount, }: {
    name: string;
    increaseFrom: string;
    tag: string;
    directory: string;
    attemptCount: number;
}): Operation<{
    atteptedVersions: string[];
}>;
