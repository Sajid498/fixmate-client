
const dns = require("node:dns");
const { spawn } = require("node:child_process");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const command = process.platform === "win32" ? "npx.cmd" : "npx";

const server = spawn(command, ["next", "dev"], {
  stdio: "inherit",
  env: process.env,
});

server.on("exit", (code) => {
  process.exit(code ?? 1);
});
