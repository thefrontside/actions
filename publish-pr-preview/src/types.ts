import { z } from "zod";

export const LernaListOutput = z.array(z.object({
  name: z.string(),
  version: z.string(),
  private: z.boolean(),
  location: z.string(),
}));

export type LernaListOutputType = z.TypeOf<typeof LernaListOutput>

export interface Package {
  name: string;
  location: string;
  version: string;
}

export type PublishedPackage = Package & { publishedVersion: string; }
export type UnsuccessfulPublishPackage = Package & { attemptedVersions: string[]; }
export type ErroredPublishPackage = Package & { error: unknown }

export type AttemptedPackage = PublishedPackage | UnsuccessfulPublishPackage | ErroredPublishPackage;

export function isPublishedPackage(pkg: AttemptedPackage): pkg is PublishedPackage {
  return (pkg as PublishedPackage).publishedVersion !== undefined;
}

export function isUnsuccessfulPublishPackage(pkg: AttemptedPackage): pkg is UnsuccessfulPublishPackage {
  return Array.isArray((pkg as UnsuccessfulPublishPackage).attemptedVersions);
}

export function isErroredPublishPackage(pkg: AttemptedPackage): pkg is ErroredPublishPackage {
  return (pkg as ErroredPublishPackage).error !== undefined;
}
