import type { Operation } from "effection";
declare type IntallParams = {
    installScript: string;
};
export declare function install({ installScript }: IntallParams): Operation<void>;
export {};
