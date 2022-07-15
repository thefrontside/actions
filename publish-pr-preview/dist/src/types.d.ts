import { z } from "zod";
export declare const LernaListOutput: z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    private: z.ZodBoolean;
    location: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    version: string;
    private: boolean;
    location: string;
}, {
    name: string;
    version: string;
    private: boolean;
    location: string;
}>, "many">;
export declare type LernaListOutputType = z.TypeOf<typeof LernaListOutput>;
export interface Package {
    name: string;
    location: string;
    version: string;
}
export declare type PublishedPackage = Package & {
    publishedVersion: string;
};
export declare type UnsuccessfulPublishPackage = Package & {
    attemptedVersions: string[];
};
export declare type ErroredPublishPackage = Package & {
    error: unknown;
};
export declare type AttemptedPackage = PublishedPackage | UnsuccessfulPublishPackage | ErroredPublishPackage;
export declare function isPublishedPackage(pkg: AttemptedPackage): pkg is PublishedPackage;
export declare function isUnsuccessfulPublishPackage(pkg: AttemptedPackage): pkg is UnsuccessfulPublishPackage;
export declare function isErroredPublishPackage(pkg: AttemptedPackage): pkg is ErroredPublishPackage;
