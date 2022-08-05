import { Operation } from "effection";
export declare function npmView({ name, version, tag, }: {
    name: string;
    version: string;
    tag: string;
}): Operation<string>;
