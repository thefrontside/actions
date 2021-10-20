const { exec, spawn } = require("@effection/process");
const { main } = require("effection");

main(function* (){
  const proc = yield exec(`npm whoami`);
  spawn(proc.stdout.forEach(x => console.log(x)));
  yield proc.join();
})
