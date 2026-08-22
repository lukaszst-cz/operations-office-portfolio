import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const files = Object.fromEntries(await Promise.all(
  ["index.html", "pracownia.html", "pracownia.js", "case-study.html", "jak-powstal-projekt.html", "article.css"].map(async (name) => [name, await readFile(join(root, name), "utf8")])
));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

check(files["index.html"].includes('id="narzedzia"'), "Brakuje sekcji narzędzi na stronie głównej.");
check(files["index.html"].includes("pracownia.html"), "Brakuje odnośnika do pracowni procesów.");
check(files["pracownia.html"].includes('id="calcForm"'), "Brakuje formularza kalkulatora.");
check(files["pracownia.html"].includes('id="yearSelect"'), "Brakuje wyboru roku KPI.");
check(files["pracownia.html"].includes("nie jest ofertą handlową"), "Brakuje zastrzeżenia kalkulatora demonstracyjnego.");
check(files["pracownia.js"].includes("DEMO"), "Brakuje syntetycznych danych KPI.");
check(files["pracownia.js"].includes("renderCalculator"), "Brakuje logiki kalkulatora.");
check(files["case-study.html"].includes("ODPOWIEDZIALNOŚĆ RACI"), "Brakuje macierzy RACI.");
check(files["case-study.html"].includes("OBSŁUGA WYJĄTKÓW"), "Brakuje scenariuszy wyjątków.");
check(files["case-study.html"].includes("Dokumentacja API"), "Brakuje odnośnika do API.");
check(files["jak-powstal-projekt.html"].includes("Przygotowałem trzy ścieżki"), "Brakuje końcowego zaproszenia do projektu.");
check(files["jak-powstal-projekt.html"].includes('href="article.css?v=2"'), "Arkusz stylów artykułu nie ma wersjonowania pamięci podręcznej.");
check(files["article.css"].includes(".article-shell .article-cta p"), "Brakuje reguły kontrastu tekstu w końcowym panelu artykułu.");
check(files["article.css"].includes("color:#fff"), "Tekst w końcowym panelu artykułu nie ma białego koloru.");

if (failures.length) {
  console.error("TOOLS QA: FAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log("TOOLS QA: PASS (14 checks)");
