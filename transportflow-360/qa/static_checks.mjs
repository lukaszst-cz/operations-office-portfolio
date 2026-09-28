import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = ["index.html","proces.html","flota.html","taxi-kontenery.html","dokumenty.html","kalkulator.html","case-study.html","jak-powstal-projekt.html","obieg-dokumentow.html","prywatnosc.html","udostepnij.html","portal/index.html","portal/instrukcja.html","portal/o-aplikacji.html"];
const problems = [];

for (const file of required) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) { problems.push(`Brak pliku: ${file}`); continue; }
  const text = fs.readFileSync(full, "utf8");
  if (!text.trim()) problems.push(`Pusty plik: ${file}`);
  if (!/<html[^>]+lang=["']pl["']/i.test(text)) problems.push(`Brak lang="pl": ${file}`);
  if (!/<meta[^>]+name=["']viewport["']/i.test(text)) problems.push(`Brak meta viewport: ${file}`);
}

const corpus = required
  .filter(file => fs.existsSync(path.join(root, file)))
  .map(file => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");

for (const phrase of ["Transport ciężki","Taxi i kontenery","28 dni","90 dni","dane syntetyczne"]) {
  if (!corpus.toLowerCase().includes(phrase.toLowerCase())) problems.push(`Brak wymaganej informacji: ${phrase}`);
}

const portalPath = path.join(root, "portal/index.html");
const portal = fs.readFileSync(portalPath, "utf8");
const portalApp = fs.readFileSync(path.join(root, "portal/app.js"), "utf8");
const expectedRoles = ["client","sales","dispatcher","driver","fleet","compliance","finance","rental","manager"];
const roleLabels = ["Klient","Handel","Dyspozytor","Kierowca","Flota i serwis","Kadry i zgodność","Finanse","Najem taxi i kontenery","Właściciel / administrator"];

for (const role of roleLabels) {
  if (!portal.includes(role)) problems.push(`Brak roli w portalu: ${role}`);
}
for (const role of expectedRoles) {
  if (!portal.includes(`value="${role}"`)) problems.push(`Brak opcji roli: ${role}`);
  if (!portal.includes(`id="${role}View"`)) problems.push(`Brak widoku roli: ${role}View`);
  if (!portalApp.includes(`"${role}"`)) problems.push(`Brak roli w app.js: ${role}`);
}
if (!portalApp.includes('new URLSearchParams(window.location.search)') || !portalApp.includes('params.get("role")')) {
  problems.push("Portal nie obsługuje deep-linków ?role=...");
}

const manifestPath = path.join(root, "portal/manifest.webmanifest");
try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.display !== "standalone") problems.push("Manifest PWA: display musi być standalone");
  if (manifest.start_url !== "./") problems.push("Manifest PWA: nieprawidłowy start_url");
  for (const icon of manifest.icons ?? []) {
    const iconPath = path.join(root, "portal", icon.src);
    if (!fs.existsSync(iconPath)) problems.push(`Manifest PWA wskazuje brakującą ikonę: ${icon.src}`);
  }
  if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) problems.push("Manifest PWA: oczekiwane ikony 192 i 512");
} catch {
  problems.push("Manifest PWA nie jest poprawnym JSON-em");
}

const mainCss = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const portalCss = fs.readFileSync(path.join(root, "portal/app.css"), "utf8");
if (!mainCss.includes("@media(max-width:900px)") || !mainCss.includes("@media(max-width:560px)")) {
  problems.push("Brak oczekiwanych breakpointów mobilnych w styles.css");
}
if (!portalCss.includes("@media(max-width:760px)") || !portalCss.includes("@media(max-width:480px)")) {
  problems.push("Brak oczekiwanych breakpointów mobilnych w portal/app.css");
}

const calculatorHtml = fs.readFileSync(path.join(root, "kalkulator.html"), "utf8");
const calculatorJs = fs.readFileSync(path.join(root, "calculator.js"), "utf8");
for (const id of ["rateForm","vehicleType","currency","loadedKm","emptyKm","fuelPrice","consumption","tolls","driverCost","fixedAllocation","otherCosts","margin","eurRate","resetCalc","totalKm","emptyShare","totalCost","costPerTotalKm","minPrice","sellRate","fuelCost","tollCost","driverCostOut","otherCostOut","marginWarning"]) {
  if (!calculatorHtml.includes(`id="${id}"`)) problems.push(`Kalkulator: brak elementu #${id}`);
}
if (!calculatorJs.includes("function calculate") || !calculatorJs.includes("calculate();")) {
  problems.push("Kalkulator: brak funkcji obliczeniowej lub inicjalizacji");
}

function walk(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item =>
    item.isDirectory() ? walk(path.join(dir,item.name)) : [path.join(dir,item.name)]
  );
}

for (const htmlFile of walk(root).filter(file => file.endsWith(".html"))) {
  const html = fs.readFileSync(htmlFile,"utf8");
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const raw = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#)/.test(raw)) continue;
    const clean = raw.split(/[?#]/)[0];
    if (!clean) continue;
    let target = path.resolve(path.dirname(htmlFile),clean);
    if (clean.endsWith("/") || (fs.existsSync(target) && fs.statSync(target).isDirectory())) target = path.join(target,"index.html");
    if (!fs.existsSync(target)) problems.push(`Niedziałający odsyłacz: ${path.relative(root,htmlFile)} -> ${raw}`);
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`PASS: ${required.length} stron, mobile viewporty, breakpointy, 9 ról z deep-linkami, PWA, kalkulator i lokalne odsyłacze.`);
