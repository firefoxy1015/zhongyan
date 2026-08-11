import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const externalBaseUrl = process.env.E2E_BASE_URL?.trim();
const port = Number.parseInt(process.env.E2E_PORT ?? "4317", 10);
const baseUrl = externalBaseUrl || `http://127.0.0.1:${port}`;
const vinextCli = fileURLToPath(new URL("../node_modules/vinext/dist/cli.js", import.meta.url));
const localServerMode = process.env.E2E_SERVER_MODE?.trim() || (process.platform === "win32" ? "harness" : "start");
let server;

const CONTENT_TYPES = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mp3", "audio/mpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".wav", "audio/wav"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: { ...process.env, ...options.env },
      stdio: "inherit",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) reject(new Error(`${command} was terminated by ${signal}.`));
      else resolve(code ?? 1);
    });
  });
}

async function waitForServer(url, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(2_000) });
      if (response.status < 500) return;
      lastError = new Error(`server returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`E2E server did not become ready at ${url}: ${lastError?.message ?? "unknown error"}`);
}

function stopServer() {
  if (!server) return;
  if (typeof server.kill === "function" && !server.killed) server.kill("SIGTERM");
  else if (typeof server.close === "function") server.close();
}

function requestHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (Array.isArray(value)) for (const item of value) headers.append(name, item);
    else if (value !== undefined) headers.set(name, value);
  }
  return headers;
}

async function serveStaticFile(request, response, clientDir, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return false;
  }
  const candidate = path.resolve(clientDir, decoded.replace(/^[/\\]+/, ""));
  const clientRoot = path.resolve(clientDir);
  const insideClient = candidate === clientRoot || candidate.toLowerCase().startsWith(`${clientRoot.toLowerCase()}${path.sep}`);
  if (!insideClient) return false;

  let metadata;
  try {
    metadata = await stat(candidate);
  } catch {
    return false;
  }
  if (!metadata.isFile()) return false;

  response.writeHead(200, {
    "Cache-Control": decoded.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "public, max-age=3600",
    "Content-Length": String(metadata.size),
    "Content-Type": CONTENT_TYPES.get(path.extname(candidate).toLowerCase()) ?? "application/octet-stream",
  });
  if (request.method === "HEAD") response.end();
  else createReadStream(candidate).pipe(response);
  return true;
}

async function sendFetchResponse(nodeResponse, webResponse) {
  nodeResponse.statusCode = webResponse.status;
  nodeResponse.statusMessage = webResponse.statusText;
  webResponse.headers.forEach((value, name) => {
    if (name.toLowerCase() !== "set-cookie") nodeResponse.setHeader(name, value);
  });
  const cookies = webResponse.headers.getSetCookie?.() ?? [];
  if (cookies.length > 0) nodeResponse.setHeader("set-cookie", cookies);
  if (!webResponse.body) {
    nodeResponse.end();
    return;
  }
  Readable.fromWeb(webResponse.body).pipe(nodeResponse);
}

async function startProductionHarness(listenPort) {
  const clientDir = path.join(root, "dist", "client");
  const workerUrl = pathToFileURL(path.join(root, "dist", "server", "index.js"));
  workerUrl.searchParams.set("e2e", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const nodeServer = createServer((request, response) => {
    void (async () => {
      const url = new URL(request.url ?? "/", `http://${request.headers.host ?? `127.0.0.1:${listenPort}`}`);
      if (await serveStaticFile(request, response, clientDir, url.pathname)) return;

      const body = request.method === "GET" || request.method === "HEAD" ? undefined : Readable.toWeb(request);
      const webRequest = new Request(url, {
        method: request.method,
        headers: requestHeaders(request.headers),
        body,
        ...(body ? { duplex: "half" } : {}),
      });
      const webResponse = await worker.fetch(webRequest, undefined, {
        waitUntil() {},
        passThroughOnException() {},
      });
      await sendFetchResponse(response, webResponse);
    })().catch((error) => {
      console.error(error);
      if (!response.headersSent) response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("E2E production harness failed.");
    });
  });

  await new Promise((resolve, reject) => {
    nodeServer.once("error", reject);
    nodeServer.listen(listenPort, "127.0.0.1", resolve);
  });
  console.log(`E2E production harness running at http://127.0.0.1:${listenPort}`);
  return nodeServer;
}

process.once("SIGINT", () => {
  stopServer();
  process.exitCode = 130;
});
process.once("SIGTERM", () => {
  stopServer();
  process.exitCode = 143;
});

try {
  if (!externalBaseUrl) {
    if (process.env.E2E_SKIP_BUILD !== "1") {
      const buildCode = await run(process.execPath, [vinextCli, "build"]);
      if (buildCode !== 0) throw new Error(`Production build failed with exit code ${buildCode}.`);
    }

    if (!["dev", "harness", "start"].includes(localServerMode)) {
      throw new Error(`E2E_SERVER_MODE must be \"dev\", \"harness\" or \"start\", received ${localServerMode}.`);
    }
    if (localServerMode === "harness") {
      server = await startProductionHarness(port);
      await waitForServer(baseUrl);
    } else {
      server = spawn(process.execPath, [vinextCli, localServerMode, "--port", String(port), "--hostname", "127.0.0.1"], {
        cwd: root,
        env: { ...process.env, HOST: "127.0.0.1", PORT: String(port) },
        stdio: "inherit",
        windowsHide: true,
      });
      const serverFailure = new Promise((_, reject) => {
        server.once("error", reject);
        server.once("exit", (code, signal) => {
          reject(new Error(`E2E server exited before readiness (code=${code ?? "none"}, signal=${signal ?? "none"}).`));
        });
      });
      await Promise.race([waitForServer(baseUrl), serverFailure]);
    }
  } else {
    await waitForServer(baseUrl, 30_000);
  }

  const testCode = await run(process.execPath, ["--test", "tests/e2e/e2e-smoke.test.mjs"], {
    env: { E2E_BASE_URL: baseUrl },
  });
  if (testCode !== 0) process.exitCode = testCode;
} catch (error) {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
} finally {
  stopServer();
}
