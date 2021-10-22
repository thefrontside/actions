const s = require("semver");
const see = (x) => console.log('x:', x);

// see(s.parse(fakeRange[1]));
// see(s.inc('1.2.3-abc.4', 'prerelease'))
// see(
//   s.maxSatisfying(['1.1.1', '1.1.2', '2.0.0', '1.3.2', '1.4.5-abc.1', '1.4.4', '1.4.5-ddd.0'], '^1.0.0-def.1', {includePrerelease: false})
// )

see(
  s.prerelease('1.1.1-ass.1')
)
/*
scenarios
  first preview on normal
    1.2.3 => 1.2.4-preview.0
    subsequent previews with no releases
      1.2.3 => 1.2.4-preview.1
    new patch release
      1.2.4 => 1.2.5-preview.0
      same for 0.2.4
        0.2.4 => 0.2.5-preview.0
    new minor release
      1.3.0 => 1.3.1-preview.0
      same for 0.3.0
        0.3.0 => 0.3.1-preview.0
    new major release
      irrelevant, get the highest minor version
  preview on prerelease
    1.2.3-beta.1 => 1.2.3-beta.1-preview.0

semver notes
  ^1.2.0 is everything under 2.0.0
  ^0.1.2 is everything under 0.2.0
  latest is last published without tag, not necessarily highest
    this is not reliable when we have multiple versions in parallel (v1 and v2)

npm view package@tag
  to see if previous preview packages were published
npm view package versions --json
  to get all versions
*/
