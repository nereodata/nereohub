#!/usr/bin/env python3
"""
Script para lanzar pruebas unitarias y BDD de NereoHub.

Uso (desde la raíz del proyecto):
  python scripts/run_tests.py                    # Todas las pruebas
  python scripts/run_tests.py tests/unit         # Solo unitarias
  python scripts/run_tests.py tests/bdd          # Solo BDD
  python scripts/run_tests.py -k "test_config"   # Pruebas que coincidan con el nombre
  python scripts/run_tests.py -m "smoke"         # Por etiqueta (si se definen markers)
  python scripts/run_tests.py tests/unit/test_config.py::test_add_project_success  # Una prueba concreta

Genera en output/test/:
  - junit.xml          Resultados en formato JUnit
  - failures_summary.md Resumen de fallos (si los hay)
  - last_summary.txt   Último resumen: pasados/total y estado
"""
import argparse
import subprocess
import sys
from pathlib import Path
from xml.etree import ElementTree

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "output" / "test"
JUNIT_PATH = OUTPUT_DIR / "junit.xml"
FAILURES_PATH = OUTPUT_DIR / "failures_summary.md"
LAST_SUMMARY_PATH = OUTPUT_DIR / "last_summary.txt"


def ensure_output_dir():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def run_pytest(extra_args: list[str]) -> subprocess.CompletedProcess:
    cmd = [
        sys.executable,
        "-m",
        "pytest",
        "-v",
        "--tb=short",
        f"--junitxml={JUNIT_PATH}",
    ] + extra_args
    return subprocess.run(cmd, cwd=PROJECT_ROOT, capture_output=False)  # Salida en tiempo real


def _is_bdd(classname: str) -> bool:
    return (classname or "").startswith("tests.bdd.")


def _is_unit(classname: str) -> bool:
    return (classname or "").startswith("tests.unit.")


def parse_junit_for_failures() -> tuple[int, int, list[dict], dict]:
    """Devuelve (passed, total, lista de fallos, stats por tipo).
    stats = {"unit": (passed, total), "bdd": (passed, total)}.
    """
    if not JUNIT_PATH.exists():
        return 0, 0, [], {"unit": (0, 0), "bdd": (0, 0)}
    tree = ElementTree.parse(JUNIT_PATH)
    root = tree.getroot()
    failures = []
    unit_pass, unit_tot = 0, 0
    bdd_pass, bdd_tot = 0, 0
    for suite in root.findall(".//testsuite"):
        for tc in suite.findall("testcase"):
            classname = tc.get("classname", "")
            fail = tc.find("failure") or tc.find("error")
            is_fail = fail is not None
            if is_fail:
                msg = (fail.text or "").strip() or (fail.get("message") or "")
                failures.append({
                    "name": tc.get("name", "?"),
                    "classname": classname,
                    "message": msg,
                })
            if _is_unit(classname):
                unit_tot += 1
                if not is_fail:
                    unit_pass += 1
            elif _is_bdd(classname):
                bdd_tot += 1
                if not is_fail:
                    bdd_pass += 1
    total = unit_tot + bdd_tot
    passed = total - len(failures)
    stats = {"unit": (unit_pass, unit_tot), "bdd": (bdd_pass, bdd_tot)}
    return passed, total, failures, stats


def write_failures_summary(failures: list[dict]):
    with open(FAILURES_PATH, "w", encoding="utf-8") as f:
        f.write("# Resumen de fallos\n\n")
        if not failures:
            f.write("No hubo fallos.\n")
            return
        f.write(f"Total de pruebas fallidas: {len(failures)}\n\n")
        for i, fail in enumerate(failures, 1):
            f.write(f"## {i}. {fail['name']}\n\n")
            if fail.get("classname"):
                f.write(f"- **Clase/archivo:** `{fail['classname']}`\n\n")
            if fail.get("message"):
                f.write("```\n")
                f.write(fail["message"][:2000])
                if len(fail.get("message", "")) > 2000:
                    f.write("\n... (truncado)")
                f.write("\n```\n\n")


def write_last_summary(
    passed: int,
    total: int,
    failed_count: int,
    exit_code: int,
    stats: dict,
):
    unit_pass, unit_tot = stats.get("unit", (0, 0))
    bdd_pass, bdd_tot = stats.get("bdd", (0, 0))
    lines = [
        f"Unitarias: {unit_pass} / {unit_tot}",
        f"BDD: {bdd_pass} / {bdd_tot}",
        "",
        f"Total pasados: {passed} / {total}",
    ]
    if failed_count:
        lines.append(f"Fallidos: {failed_count}")
    lines.append(f"Estado: {'OK' if exit_code == 0 else 'FALLOS'}")
    text = "\n".join(lines)
    with open(LAST_SUMMARY_PATH, "w", encoding="utf-8") as f:
        f.write(text + "\n")
    print()
    print("--- Resumen ---")
    print(f"Unitarias: {unit_pass} / {unit_tot}")
    print(f"BDD: {bdd_pass} / {bdd_tot}")
    print(f"Total pasados: {passed} / {total}")
    if failed_count:
        print(f"Fallidos: {failed_count}")
        print(f"Detalle de fallos: {FAILURES_PATH}")
    print(f"Resumen guardado en: {LAST_SUMMARY_PATH}")


def main():
    parser = argparse.ArgumentParser(
        description="Lanza pruebas unitarias y BDD. Por defecto ejecuta todas."
    )
    parser.add_argument(
        "positional",
        nargs="*",
        help="Rutas o nodos de pytest (ej: tests/unit, tests/bdd, -k 'nombre', -m 'tag').",
    )
    parser.add_argument(
        "-k", "--keyword",
        dest="keyword",
        metavar="EXPR",
        help="Solo pruebas que coincidan con EXPR (pytest -k).",
    )
    parser.add_argument(
        "-m", "--marker",
        dest="marker",
        metavar="MARK",
        help="Solo pruebas con la etiqueta MARK (pytest -m).",
    )
    args, unknown = parser.parse_known_args()

    extra = list(args.positional) + unknown
    if args.keyword:
        extra.extend(["-k", args.keyword])
    if args.marker:
        extra.extend(["-m", args.marker])

    # Por defecto ejecutar todas las pruebas (tests/)
    if not extra:
        extra = ["tests/"]

    ensure_output_dir()
    result = run_pytest(extra)
    passed, total, failures, stats = parse_junit_for_failures()
    write_failures_summary(failures)
    write_last_summary(passed, total, len(failures), result.returncode, stats)
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
