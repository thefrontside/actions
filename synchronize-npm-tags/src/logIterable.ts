import { colors } from "@frontside/actions-utils";

export function logIterable(
  description: string,
  iterable: string[]
): void {
  if (iterable.length) {
    console.log(colors.yellow(description));
    iterable.forEach(i => console.log("  "+colors.blue(i)));
    console.log("");
  }
}
