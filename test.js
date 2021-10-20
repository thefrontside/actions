const { main } = require("effection");
const { exec } = require("@effection/process");

main(function* () {
  const npmwho = yield exec(`npm whoami`);
  const result = yield npmwho.join();
  console.log(result);
});
