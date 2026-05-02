import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const procs = [];

function start(name, cwd, env, color) {
  const child = spawn(
    process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    ["run", "dev"],
    { cwd, env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"], shell: false },
  );
  procs.push(child);

  const tag = `\x1b[${color}m[${name}]\x1b[0m`;
  child.stdout.on("data", (d) => process.stdout.write(d.toString().split("\n").map((l) => l ? `${tag} ${l}` : l).join("\n")));
  child.stderr.on("data", (d) => process.stderr.write(d.toString().split("\n").map((l) => l ? `${tag} ${l}` : l).join("\n")));
  child.on("exit", (code) => {
    console.log(`${tag} exited with ${code}`);
    procs.forEach((p) => p !== child && !p.killed && p.kill("SIGTERM"));
    process.exit(code ?? 0);
  });
}

start("api", path.join(root, "artifacts", "api-server"), { PORT: "8080", NODE_ENV: "development" }, "36");
start("web", path.join(root, "artifacts", "gaokao"),     { PORT: "5173", BASE_PATH: "/", API_PROXY_TARGET: "http://localhost:8080" }, "35");

function shutdown() {
  procs.forEach((p) => !p.killed && p.kill("SIGTERM"));
  setTimeout(() => process.exit(0), 500);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
