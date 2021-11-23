export interface ToDeprecate {
    name: string;
    description: string;
}
export interface ToPublish {
    name: string;
    version: string;
    path: string;
}
interface PackagesList {
    pkgsToPublish: ToPublish[];
    pkgsToDeprecate: ToDeprecate[];
}
export declare function listPackages(): PackagesList;
export {};
