#!/usr/bin/env python3
"""
Compile all contracts and extract ABI files — no deployment.

Usage:
    python scripts/extract_abi.py

Output:
    artifacts/abi/<ContractName>.json   ← one per contract
"""

import json
import sys
from pathlib import Path
from solcx import compile_files, install_solc, set_solc_version

CONTRACTS_DIR = Path(__file__).parent.parent / "contracts"
ABI_DIR       = Path(__file__).parent.parent / "artifacts" / "abi"
SOLC_VERSION  = "0.8.20"

def main():
    print("\n  Installing solc (if not cached)…")
    install_solc(SOLC_VERSION, show_progress=False)
    set_solc_version(SOLC_VERSION)

    project_root = CONTRACTS_DIR.parent
    node_modules = project_root / "node_modules"
    if not node_modules.exists():
        print("\n[ERROR] node_modules not found. Run: npm install")
        sys.exit(1)

    remapping = f"@openzeppelin={node_modules / '@openzeppelin'}"
    sol_files  = sorted(CONTRACTS_DIR.glob("*.sol"))

    print(f"  Compiling {len(sol_files)} contract(s)…")
    compiled = compile_files(
        [str(f) for f in sol_files],
        output_values=["abi"],
        import_remappings=[remapping],
        solc_version=SOLC_VERSION,
        allow_paths=[str(project_root), str(node_modules)],
    )

    ABI_DIR.mkdir(parents=True, exist_ok=True)

    print(f"\n  {'Contract':<25} ABI entries  Output")
    print(f"  {'─'*60}")
    for key, data in sorted(compiled.items()):
        name = key.split(":")[-1]
        abi  = data["abi"]
        out  = ABI_DIR / f"{name}.json"
        out.write_text(json.dumps(abi, indent=2))
        print(f"  {name:<25} {len(abi):<12} artifacts/abi/{name}.json")

    print(f"\n  Done — {len(compiled)} ABI file(s) written to artifacts/abi/\n")

if __name__ == "__main__":
    main()
