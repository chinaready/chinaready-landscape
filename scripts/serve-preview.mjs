#!/usr/bin/env node
/**
 * Local static preview with Cloudflare Pages–style pretty URLs.
 *
 * Production HTML links use extensionless paths such as
 * `/alternatives/amazon-cloudwatch`. On disk those pages are
 * `build/alternatives/amazon-cloudwatch.html`. Cloudflare Pages maps the
 * extensionless URL automatically; CNCF landscape2 serve does not, which
 * yields blank/404 pages during local review.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const DEFAULT_PORT = 8000;
const DEFAULT_DIR = path.join(root, "build");

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

function contentTypeFor(filePath) {
  const base = path.basename(filePath);
  if (base === "api-catalog") return "application/linkset+json";
  if (base === "openapi.json") return "application/vnd.oai.openapi+json;version=3.1";
  const ext = path.extname(filePath).toLowerCase();
  return CONTENT_TYPES[ext] || "application/octet-stream";
}

function parseArgs(argv) {
  let landscapeDir = DEFAULT_DIR;
  let port = DEFAULT_PORT;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--landscape-dir" && argv[i + 1]) {
      landscapeDir = path.resolve(root, argv[++i]);
    } else if (arg === "--port" && argv[i + 1]) {
      port = Number(argv[++i]);
    } else if (arg === "--help" || arg === "-h") {
      console.log(
        "Usage: node scripts/serve-preview.mjs [--landscape-dir build] [--port 8000]",
      );
      process.exit(0);
    }
  }
  return { landscapeDir, port };
}

function isInsideRoot(filePath, rootDir) {
  const resolved = path.resolve(filePath);
  const rootResolved = path.resolve(rootDir) + path.sep;
  return resolved === path.resolve(rootDir) || resolved.startsWith(rootResolved);
}

function resolveFile(rootDir, requestPath) {
  const raw = decodeURIComponent((requestPath || "/").split("?")[0].split("#")[0]);
  const normalized = path.posix.normalize(raw.startsWith("/") ? raw : `/${raw}`);
  if (normalized.includes("\0") || normalized.includes("..")) return null;

  const absolute = path.resolve(rootDir, `.${normalized}`);
  if (!isInsideRoot(absolute, rootDir)) return null;

  if (fs.existsSync(absolute)) {
    const stat = fs.statSync(absolute);
    if (stat.isFile()) return absolute;
    if (stat.isDirectory()) {
      const indexFile = path.join(absolute, "index.html");
      if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) return indexFile;
    }
  }

  if (!path.extname(absolute)) {
    const htmlFile = `${absolute}.html`;
    if (fs.existsSync(htmlFile) && fs.statSync(htmlFile).isFile()) return htmlFile;
  }

  return null;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function serveFile(res, filePath) {
  const type = contentTypeFor(filePath);
  const body = fs.readFileSync(filePath);
  send(res, 200, body, {
    "Content-Type": type,
    "Content-Length": body.length,
    "Cache-Control": "no-store",
  });
}

function startServer({ landscapeDir, port }) {
  if (!fs.existsSync(landscapeDir)) {
    console.error(`Landscape directory not found: ${landscapeDir}`);
    console.error("Run `npm run build` first.");
    process.exit(1);
  }

  const server = http.createServer((req, res) => {
    try {
      if (req.method !== "GET" && req.method !== "HEAD") {
        send(res, 405, "Method Not Allowed", { "Content-Type": "text/plain; charset=utf-8" });
        return;
      }
      const filePath = resolveFile(landscapeDir, req.url || "/");
      if (!filePath) {
        const notFoundPage = path.join(landscapeDir, "404.html");
        if (fs.existsSync(notFoundPage) && fs.statSync(notFoundPage).isFile()) {
          const body = fs.readFileSync(notFoundPage);
          send(res, 404, req.method === "HEAD" ? "" : body, {
            "Content-Type": "text/html; charset=utf-8",
            "Content-Length": body.length,
            "Cache-Control": "no-store",
          });
          return;
        }
        send(res, 404, "Not Found", { "Content-Type": "text/plain; charset=utf-8" });
        return;
      }
      if (req.method === "HEAD") {
        send(res, 200, "", {
          "Content-Type": contentTypeFor(filePath),
          "Cache-Control": "no-store",
        });
        return;
      }
      serveFile(res, filePath);
    } catch (error) {
      console.error(error);
      send(res, 500, "Internal Server Error", { "Content-Type": "text/plain; charset=utf-8" });
    }
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`Chinaready landscape preview (pretty URLs) at http://127.0.0.1:${port}`);
    console.log(`Serving ${landscapeDir}`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer(parseArgs(process.argv.slice(2)));
}

export { parseArgs, resolveFile, startServer };
