# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/frg-fossee/eSim-Cloud/compare/develop...HEAD)

### Added

- **Two-Tier Hybrid Autotuning Optimizer:** Integrated global exploration (Optuna TPE) with local refinement (SciPy Nelder-Mead downhill simplex). It splits the simulation budget (75% global, 25% local) to achieve high precision and speed. [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti
- **AutoTune CLI Verification Tool:** Created `verify_autotune.py` in the backend root directory to allow developers to execute, log, and benchmark AC and Transient autotuning trials directly from the terminal. [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti
- **Unit Testing for Autotuning:** Added comprehensive unit test coverage in `tests.py` covering multi-header parsing and optimization validation. [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti
- **Changelog:** Created this `CHANGELOG.md` file to track repository modifications and standards upgrades. [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti

### Changed

- **Compose Standards Modernization:** Removed deprecated `version` attributes from `docker-compose.dev.yml` and `docker-compose.prod.yml` to prevent Compose execution warnings. [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti
- **Python Requirements Cleanup:** Removed duplicate entries (`psycopg2`, `Pillow`) in `requirements.txt`. [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti
- **Code Documentation & Standards:** Standardized imports, formatted the codebase, and added 100% strict PEP-484 type annotations and PEP-257 docstrings to `autotune_helper.py`, `verify_autotune.py`, `parse.py`, and `tasks.py` (fully compatible with Python 3.7). [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti
- **Codebase Standards Enforcement:** Ported Neural-LAM repository quality standards to `eSim-Cloud`. Created `AGENTS.md` to define AI assistant protocols. Integrated `.pre-commit-config.yaml` and `pyproject.toml` in the root to configure `black`, `isort`, `flake8`, `mypy`, and `interrogate` for automated quality checks. [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti
- **Housekeeping:** Deleted temporary test circuit files (`test_cir.cir`, `test_cir2.cir`) from the backend root directory. [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti

### Fixed

- **Header Logo Cutoff:** Fixed layout alignment in unauthenticated header Home link to prevent logo squeezing and truncation. [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti
- **History Panel Rendering Crash:** Added safe URL parameter parsing using `URLSearchParams` in `VersionComponent.js` to prevent fatal TypeErrors and rendering crashes when query parameters are absent. [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti
- **Resizable Sidebars:** Made left and right editor sidebars resizable by adding mouse-based vertical drag handles without extra packages. [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti
- **Page-Break Parser Bug:** Fixed `parse_data_file` in `autotune_helper.py` which reset the simulation arrays when encountering Form Feed page breaks in `data.txt`. The parser now uses index lookahead check to only reset on new simulation runs (Index 0). [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti
- **Frontend Container Node Upgrades:** Upgraded Node base image in `eda-frontend/Dockerfile` and `ArduinoFrontend/Dockerfile` from Node 10 to Node 16 to fix kernel compatibility issues on modern hosts. [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti
- **Peer Dependency resolution:** Added `--legacy-peer-deps` flag to frontend docker-compose npm installations to bypass build-blocking legacy package conflicts. [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti
- **Whitenoise Volume deadlocks:** Disabled file compression deadlocks under Django debug settings on Virtual VirtioFS/OSX mounted drives. [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti
- **SQLite Concurrency Safety:** Configured SQLite database lock timeout limits (`timeout=30`) for robust parallel optuna study writes. [\#575](https://github.com/frg-fossee/eSim-Cloud/pull/575) @GiGiKoneti
