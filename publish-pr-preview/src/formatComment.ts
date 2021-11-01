import { PublishResults, PublishedPackages } from "./publish";

export function formatComment({ published }: { published: PublishResults }): string {
  let { tag, publishedPackages } = published;

  if (publishedPackages.length >= 1) {
    let installInstructionsForEachPackage = ({
      publishedPackages,
    }:{
      publishedPackages: PublishedPackages[],
    }) => {
      return publishedPackages.reduce((acc, pkg) => {
        return acc+`<details><summary><code>${pkg.packageName}</code>@<code>${pkg.version}</code></summary><hr>Install using the following command:<br><pre>yarn add ${pkg.packageName}@${tag}</pre><hr></details>`;
      }, "");
    };

    return "The following package(s) were published:<br>"+installInstructionsForEachPackage;
  } else {
    return "📣 NOTIFICATION<br>You are receiving this message because we did not publish any packages.";
  }
}
