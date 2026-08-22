import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const portal = join(here, "..");
const files = Object.fromEntries(await Promise.all(
  ["index.html", "app.js", "manifest.webmanifest", "sw.js", "instrukcja.html", "o-aplikacji.html"].map(async (name) => [name, await readFile(join(portal, name), "utf8")])
));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

check(files["index.html"].includes('id="clientView"'), "Brakuje widoku klienta.");
check(files["index.html"].includes('id="departmentsView"'), "Brakuje panelu działów.");
check(files["app.js"].includes("ZM-2024-018"), "Brakuje danych demonstracyjnych zlecenia.");
check(files["app.js"].includes("localStorage"), "Brakuje lokalnego zapisu stanu demonstracyjnego.");
check(files["app.js"].includes("serviceWorker"), "Brakuje rejestracji service workera.");
check(files["app.js"].includes("aria-selected"), "Brakuje stanu aktywnego widoku dla technologii wspomagających.");
check(files["sw.js"].includes("caches.delete"), "Brakuje czyszczenia poprzedniej wersji cache PWA.");
check(files["sw.js"].includes("skipWaiting"), "Brakuje aktywacji nowej wersji PWA bez zbędnego oczekiwania.");
check(files["manifest.webmanifest"].includes('"display": "standalone"'), "Manifest nie określa trybu standalone.");
check(files["manifest.webmanifest"].includes('"icons"'), "Manifest nie ma ikony.");
check(files["manifest.webmanifest"].includes('"icon-192.png"'), "Manifest nie ma ikony PNG dla urządzeń mobilnych.");
check(files["sw.js"].includes('"./app.js"'), "Service worker nie cache'uje JavaScript.");
check(files["sw.js"].includes('"./accessibility.css"'), "Service worker nie cache'uje dodatków dostępności.");
check(files["sw.js"].includes('"./manifest.webmanifest"'), "Service worker nie cache'uje manifestu.");
check(files["instrukcja.html"].includes("Android"), "Brakuje instrukcji Android.");
check(files["instrukcja.html"].includes("iPhone"), "Brakuje instrukcji Apple.");
check(files["o-aplikacji.html"].includes("SQLite"), "Brakuje opisu SQLite.");

if (failures.length) {
  console.error("STATIC QA: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("STATIC QA: PASS (17 checks)");
