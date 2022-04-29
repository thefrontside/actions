import { ansiColors } from "./ansiColors";

export function logIterable(
  description: string,
  iterable: string[],
  emptyDescription?: string,
): void {
  if (iterable.length) {
    console.log(ansiColors.yellow(description));
    iterable.forEach(i => console.log("  "+ansiColors.blue(i)));
    console.log("");
  } else {
    emptyDescription && console.log(ansiColors.purple(emptyDescription+"\n"));
  }
}
