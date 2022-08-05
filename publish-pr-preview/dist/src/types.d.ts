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
