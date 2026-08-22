import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = ["index.html","proces.html","flota.html","taxi-kontenery.html","dokumenty.html","kalkulator.html","case-study.html","jak-powstal-projekt.html","portal/index.html"];
const problems = [];
for (const file of required) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) { problems.push(`Brak pliku: ${file}`); continue; }
  const text = fs.readFileSync(full, "utf8");
  if (!text.trim()) problems.push(`Pusty plik: ${file}`);
}
const corpus = required.filter(f => fs.existsSync(path.join(root,f))).map(f => fs.readFileSync(path.join(root,f),"utf8")).join("\n");
for (const phrase of ["Transport ciężki","Taxi i kontenery","28 dni","90 dni","dane syntetyczne"]) {
  if (!corpus.toLowerCase().includes(phrase.toLowerCase())) problems.push(`Brak wymaganej informacji: ${phrase}`);
}
const portal = fs.readFileSync(path.join(root,"portal/index.html"),"utf8");
for (const role of ["Klient","Handel","Dyspozytor","Kierowca","Flota i serwis","Kadry i zgodność","Finanse","Najem taxi i kontenery","Właściciel / administrator"]) {
  if (!portal.includes(role)) problems.push(`Brak roli w portalu: ${role}`);
}
function walk(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item => item.isDirectory() ? walk(path.join(dir,item.name)) : [path.join(dir,item.name)]);
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
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`PASS: ${required.length} stron, osobne moduły floty, reguły 28/90 i 9 ról.`);
