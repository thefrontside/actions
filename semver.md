semver objection (not all)
  raw & version - version in string
  loose - boolean
  options: {}
  major - number
  minior - number
  patch - number
  prereelease - array split by .

semverOptions
  loose: boolean // wtf is loose
  includePrerelease?: boolean

# working with versions
fn(x, boolean|{options});

- `parse` - Return the parsed version as a SemVer object, or null if it's not valid.
- `valid` - Return the parsed version as a string, or null if it's not valid.
- `clean` - Returns cleaned (removed leading/trailing whitespace, remove '=v' prefix) and parsed version, or null if version is invalid.
- `major` - Return the major version number.
- `minor` - Return the minor version number.
- `patch` - Return the patch version number.
- `prerelease` - Returns an array of prerelease components, or null if none exist.

fn(x, release: major|minor|patch|prerelease, identifier?: string);
- `inc` - Return the version incremented by the release type (major, minor, patch, or prerelease), or null if it's not valid.

fn(v1, v2, boolean|{options});

- `diff` - Returns difference between two versions by the release type (major, premajor, minor, preminor, patch, prepatch, or prerelease), or null if the versions are the same.
- `compare` - Compares two versions excluding build identifiers (the bit after `+` in the semantic version string). Sorts in ascending order when passed to `Array.sort()`.
  - Returns `0` if `v1` == `v2`; returns `1` if `v1` is greater; returns `-1` if `v2` is greater.
- `rcompare` - The reverse of compare.

fn(v1, v2);

- `compareLoose` - No explanation.
- `compareBuild` - Compares two versions including build identifiers (the bit after `+` in the semantic version string).
  - Returns `0` if `v1` == `v2`; returns `1` if `v1` is greater; returns `-1` if `v2` is greater.

fn([], boolean|{options});

- `sort` - Sorts an array of semver entries in ascending order using `compareBuild()`.
- `rsort` -  Sorts an array of semver entries in descending order using `compareBuild()`.

# low-level comparators between versions
fn(v1, v2, boolean|{options});

- `gt` - v1 > v2
- `lt` - v1 < v2
- `eq` - v1 == v2 This is true if they're logically equivalent, even if they're not the exact same string. You already know how to compare strings.
- `neq` - v1 != v2 The opposite of eq.
- `gte` - v1 >= v2
- `lte` - v1 <= v2

fn(v1, operator, v2, boolean|{options});

- `cmp` - Pass in a comparison string, and it'll call the corresponding semver comparison function. "===" and "!==" do simple string comparison, but are included for completeness. Throws if an invalid comparison string is provided.

fn(x, {options});

- `coerce` - Coerces a string to SemVer if possible

# working with ranges
fn(version, range, boolean|{options});

- `satisfies` - Return true if the version satisfies the range.
- `maxSatisfying` - Return the highest version in the list that satisfies the range, or null if none of them do.
- `minSatisfying` - Return the lowest version in the list that satisfies the range, or null if none of them do.
- `gtr` - Return true if version is greater than all the versions possible in the range.
- `ltr` - Return true if version is less than all the versions possible in the range.

fn(range, boolean|{options});

- `minVersion` - Return the lowest version that can possibly match the given range.
- `validRange` - Return the valid range or null if it's not valid

fn(version, range, hilo: '>'|'<', boolean|{options});

- `outside` -  Return true if the version is outside the bounds of the range in either the high or low direction. The hilo argument must be either the string '>' or '<'. (This is the function called by gtr and ltr.)

fn(range1, range2, boolean|{options});

- `intersects` - Return true if any of the ranges comparators intersect

fn(ranges: string[], range, {options});

- `simplifyRange` - Return a "simplified" range that matches the same items in `versions` list as the range specified.
  - Note that it does *not* guarantee that it would match the same versions in all cases, only for the set of versions provided. This is useful when generating ranges by joining together multiple versions with `||` programmatically, to provide the user with something a bit more ergonomic. If the provided range is shorter in string-length than the generated range, then that is returned.

fn(sub, dom, {options});

- `subset` - Return true if the subRange range is entirely contained by the superRange range.
