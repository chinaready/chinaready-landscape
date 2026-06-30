import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { arch, platform } from "node:os";

const root = process.cwd();
const landscape2Version = "v1.1.0";

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function landscape2Target() {
  if (platform() === "darwin" && arch() === "arm64") {
    return "landscape2-aarch64-apple-darwin";
  }
  if (platform() === "linux" && arch() === "x64") {
    return "landscape2-x86_64-unknown-linux-gnu";
  }
  throw new Error(`Unsupported platform for landscape2 preview: ${platform()} ${arch()}`);
}

function ensureLandscape2() {
  const target = landscape2Target();
  const binary = path.join(root, ".tools", target, "landscape2");
  if (fs.existsSync(binary)) return binary;

  fs.mkdirSync(path.join(root, ".tools"), { recursive: true });
  const archive = path.join(root, ".tools", `${target}.tar.xz`);
  const url = `https://github.com/cncf/landscape2/releases/download/${landscape2Version}/${target}.tar.xz`;

  run("curl", ["-L", "-o", archive, url]);
  run("tar", ["-xf", archive, "-C", path.join(root, ".tools")]);
  fs.chmodSync(binary, 0o755);
  return binary;
}

const binary = ensureLandscape2();
run(binary, process.argv.slice(2));
