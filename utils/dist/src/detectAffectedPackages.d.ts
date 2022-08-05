import { Operation } from "effection";
import { z } from "zod";
declare const LernaListOutput: z.ZodArray<z.ZodObject<{
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
export declare function detectAffectedPackages({ baseRef }: {
    baseRef: string;
}): Operation<LernaListOutputType>;
export {};
