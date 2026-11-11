// Cloudflare Pages output: the static site lives in dist/ (SPA shell served at / and for unknown paths).
import { copyFileSync, cpSync, rmSync, writeFileSync } from "node:fs";
copyFileSync("dist/client/_shell.html", "dist/client/index.html");
writeFileSync("dist/client/_redirects", "/* /index.html 200\n");
cpSync("dist/client", "dist", { recursive: true });
rmSync("dist/client", { recursive: true, force: true });
rmSync("dist/server", { recursive: true, force: true });
console.log("Static site ready in dist/");
