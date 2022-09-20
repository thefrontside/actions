export interface ToDeprecate {
    name: string;
    description: string;
}
export interface PackageInfo {
    name: string;
    version: string;
    path: string;
}
interface PackagesList {
    pkgsToPublish: PackageInfo[];
    pkgsToDeprecate: ToDeprecate[];
}
export declare function listPackages(directory?: string): PackagesList;
export {};
