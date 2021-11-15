export const fixturePackageJson= ({
  pkgName,
  pkgVersion = "0.0.0",
  privatePkg = true,
}:{
  pkgName: string,
  pkgVersion?: string,
  privatePkg?: boolean
}): string => {
  return JSON.stringify({ name: pkgName, version: pkgVersion, private: privatePkg }, null, 2);
};
