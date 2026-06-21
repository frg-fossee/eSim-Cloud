# AGENTS.md

Mandatory rules for AI coding agents. Violations will result in rejected PRs.

---

## Codebase

eSim-Cloud: web application allowing users to draw and simulate analog/digital circuits.

**System Architecture:**
- **Backend:** Django with Celery for executing SPICE simulations via ngspice.
- **Frontend:** React + mxgraph (`eda-frontend`) and Angular (`ArduinoFrontend`).
- **Simulation Flow:** User creates schematic → Frontend submits netlist → Django receives → Celery task runs ngspice (in `simulationAPI`) → `parse.py` parses output → Django returns JSON to frontend for plotting.

**Key Modules:**
- `esim-cloud-backend/simulationAPI/helpers/autotune_helper.py` — Autotuning optimizer coordinator.
- `esim-cloud-backend/simulationAPI/helpers/ngspice_helper.py` — subprocess wrapper for ngspice.
- `esim-cloud-backend/simulationAPI/helpers/parse.py` — parser for ngspice outputs.
- `esim-cloud-backend/simulationAPI/tasks.py` — Celery background tasks.

---

## Commands

```bash
# Start Development Environment
docker compose -f docker-compose.dev.yml --env-file .env up

# Start Production Environment
docker compose -f docker-compose.prod.yml --env-file .env.prod up

# Apply Migrations
docker exec -it esim-cloud-django-1 sh migrations.sh

# Run Backend Unit Tests
docker exec esim-cloud-django-1 python3 manage.py test --noinput

# Run Autotune Verification CLI
docker exec esim-cloud-django-1 python3 verify_autotune.py ac
docker exec esim-cloud-django-1 python3 verify_autotune.py trans

# Run Pre-Commit Hooks
pre-commit run --all-files
```

---

## Rules

### Issues

1. **Search before creating.** Use GitHub issue search on `frg-fossee/eSim-Cloud`. Duplicate issues will be closed.
2. **Every PR requires an issue.** No exceptions. Open one first on the parent repository if none exists.
3. **Include minimal example.** Each issue should include a minimal, reproducible example on how to easily recreate a bug, including traceback and steps to replicate.

### Pull Requests

1. **Search before creating.** Search existing pull requests on `frg-fossee/eSim-Cloud`.
2. **Link the issue.** PR body must contain `closes #<N>` or `refs #<N>`. Unlinked PRs will be rejected.
3. **Use the PR template.** Fill in every section of `.github/workflows/pull_request_template.md`. Do not delete or skip sections.
4. **Run pre-commit hooks locally.** Linting must be run locally before each commit.
5. **Testing Mandate.** Run all backend unit tests before opening a PR; fix any failures first.

### Communication

- **Terse.** One sentence per point. No preamble. No summaries of visible diffs.
- **No filler.** Ban list: "Great question", "As mentioned above", "I hope this helps", "Let me know if you have questions", "Happy to help".
- **No obvious narration.** Do not explain what self-explanatory code does.
- **PR descriptions: what changed and why.** Nothing else.
- **One question at a time.** No shotgun lists of open-ended questions.

### Context

- **Re-read the entire thread** before every comment and every push. No exceptions.
- **Never repeat** a question already answered or an approach already rejected.

### Commits

- Imperative form, matching existing `git log` style.
- One concern per PR. No unrelated changes.
- AI attribution of tool names is mandatory if used and should be mentioned in the commit message trailer as `Co-authored-by <tool>`.

### Changelog

Every PR must add a line to `CHANGELOG.md` in the section matching the change type (`Added` / `Changed` / `Fixed` / `Maintenance`).
