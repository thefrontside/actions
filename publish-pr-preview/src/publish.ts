export function* publish(directoriesToPublish: Iterable<string>): Generator<any, string[], any> {
  // detect for workspace to compare with directoresToPublish to see which one to install separately
    // ❌ bad idea; we don't know what kind of setup users will have in their monorepo
  /*
    install
      input_install
        ? input_install
        : yarn lock
          ? use yarn
          : use npm
  */
  // skip private packages
  console.log('publishing:', directoriesToPublish);
  return [''];
}
