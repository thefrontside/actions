export function* publish(directoriesToPublish: Iterable<string>) {

  // detect for workspace to compare with directoresToPublish to see which one to install separately
    // ❌ bad idea; we don't know what kind of setup users will have in their monorepo
  
  // yarn install at root
    /*
      yarn lock
        ? use yarn
        : use npm
    */

  // yarn custom install at root
  
  // skip private packages
  console.log('publishing:', directoriesToPublish);
  return [''];
}
