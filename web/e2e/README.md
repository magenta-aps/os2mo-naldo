# Payload characterization harness

Verifies that a form refactor is behavior-preserving by comparing the *output*
of the forms — the GraphQL mutation input they submit — before and after a
change. The harness drives the forms in a headless browser, intercepts the
mutation at the network layer (nothing reaches MO), and writes the captured
variables to a JSON file per run.

## Prerequisites

- The dev server running against a local MO: `yarn dev`
- MO + Keycloak on `localhost:5000` with the dev user `bruce`/`bruce`
- A fixture containing at least one engagement, and classes in the
  `engagement_job_function`, `engagement_type`, and `primary_type` facets
  (the harness resolves its test objects from MO at startup)

## Usage

```bash
# on the baseline ref
node e2e/capture-engagement-payloads.cjs old
git checkout <your-branch>   # dev server picks up the change
node e2e/capture-engagement-payloads.cjs new
diff payloads-old.json payloads-new.json
```

Identical files mean the refactor preserved every form's submitted payload.
A diff is not necessarily a failure — but it must be explainable, deliberate,
and called out in the MR description.

# Smoke crawler

Catches the bug classes nothing else does: reactive infinite loops (a frozen
main thread), render crashes, and dead controls. It crawls every form route,
and per form: sets the start date, opens and picks every select, changes the
start date (re-running the option refetches, where update loops live), and
picks again — with a responsiveness probe after every step. All mutations are
blocked at the network layer.

```bash
node e2e/smoke-crawl.cjs                    # full crawl, ~0 on success
node e2e/smoke-crawl.cjs --only create/class  # filter routes by substring
```

Any nonzero exit is a failure (a run that hit a frozen page exits 137 — it
has to SIGKILL its own process group to escape the wedged renderer).
Run it before merging anything that touches forms or shared form components.
