import expect from "expect";
import s from "semver";

function practiceLoop ({
  increaseFrom,
  tag,
  attemptCount,
}:{
  increaseFrom: string,
  tag: string,
  attemptCount: number,
}) {
  let bump = (version: string) => s.inc(version, "prerelease", tag) || "";
  while (attemptCount > 0) {
    if (attemptCount == 5) {
      return "out";
    }
    increaseFrom = bump(increaseFrom);
    attemptCount--;
  }
  return increaseFrom;
}

describe("javascript loop refresher", () => {
  it("semver increases through loop", () => {
    let thrice = practiceLoop({ increaseFrom: "1.1.1", tag: "branch", attemptCount: 3 });
    let twice = practiceLoop({ increaseFrom: "1.1.1", tag: "branch", attemptCount: 2 });
    expect(thrice).toBe("1.1.2-branch.2");
    expect(twice).toBe("1.1.2-branch.1");
  });
  it("loop exits if it returns", () => {
    let result = practiceLoop({ increaseFrom: "1.1.1", tag: "branch", attemptCount: 5 });
    expect(result).toBe("out");
  });
});
