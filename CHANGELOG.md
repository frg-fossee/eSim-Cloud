# Changelog

All notable changes to the `eSim-Cloud` project will be documented in this file.

## [Unreleased] - 2026-06-21

### Added
- **Two-Tier Hybrid Autotuning Optimizer:** Integrated global exploration (Optuna TPE) with local refinement (SciPy Nelder-Mead downhill simplex). It splits the simulation budget (75% global, 25% local) to achieve high precision and speed.
- **AutoTune CLI Verification Tool:** Created `verify_autotune.py` in the backend root directory to allow developers to execute, log, and benchmark AC and Transient autotuning trials directly from the terminal.
- **Unit Testing for Autotuning:** Added comprehensive unit test coverage in `tests.py` covering multi-header parsing and optimization validation.
- **Changelog:** Created this `CHANGELOG.md` file to track repository modifications and standards upgrades.

### Fixed
- **Page-Break Parser Bug:** Fixed `parse_data_file` in `autotune_helper.py` which reset the simulation arrays when encountering Form Feed page breaks in `data.txt`. The parser now uses index lookahead check to only reset on new simulation runs (Index 0).
- **Frontend Container Node Upgrades:** Upgraded Node base image in `eda-frontend/Dockerfile` and `ArduinoFrontend/Dockerfile` from Node 10 to Node 16 to fix kernel compatibility issues on modern hosts.
- **Peer Dependency resolution:** Added `--legacy-peer-deps` flag to frontend docker-compose npm installations to bypass build-blocking legacy package conflicts.
- **Whitenoise Volume deadlocks:** Disabled file compression deadlocks under Django debug settings on Virtual VirtioFS/OSX mounted drives.
- **SQLite Concurrency Safety:** Configured SQLite database lock timeout limits (`timeout=30`) for robust parallel optuna study writes.

### Changed
- **Compose Standards Modernization:** Removed deprecated `version` attributes from `docker-compose.dev.yml` and `docker-compose.prod.yml` to prevent Compose execution warnings.
- **Python Requirements Cleanup:** Removed duplicate entries (`psycopg2`, `Pillow`) in `requirements.txt`.
- **Code Documentation & Standards:** Standardized imports, formatted the codebase, and added 100% strict PEP-484 type annotations and PEP-257 docstrings to `autotune_helper.py`, `verify_autotune.py`, `parse.py`, and `tasks.py` (fully compatible with Python 3.7).
- **Housekeeping:** Deleted temporary test circuit files (`test_cir.cir`, `test_cir2.cir`) from the backend root directory.

