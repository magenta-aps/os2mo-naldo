# e2e tests

Playwright tests against the local dev setup, built for the form refactors:
they verify that a rewritten form still behaves like the old one (same
submitted payloads, working selects and refetches, no freezes). All tests log
in as `bruce` and block GraphQL mutations from the page, so forms can never
write to MO.

The same suite runs in CI (the `E2E tests` job): MO, Keycloak and the
database start as GitLab services via os2mo's integration-test template, the
frontend is served with `yarn build && yarn preview`, and `seed.cjs`
bootstraps the empty database. All URLs come from `MO_URL`, `KEYCLOAK_URL`
and `BASE_URL`, defaulting to the local dev setup. The pipeline is the
gate; running locally is optional, just much faster feedback.

**Prerequisites locally:** the frontend dev server on `localhost:5173`
(`docker compose up -d` in this repo), MO + Keycloak on `localhost:5000`.
After resetting MO, run `node e2e/seed.cjs` — it idempotently creates the
facets and classes the forms need, and on a completely empty database also
the organisation, an org unit, an employee and an engagement.

## Commands

```
yarn verify                    # unit tests + the e2e suite
yarn e2e                       # just the e2e suite
yarn e2e --headed              # watch it in a visible browser
yarn e2e -g "create class"     # filter by test name
```

## smoke.spec.ts

Touches every form (set date, pick all selects, change date, pick again) and
fails if a page crashes, freezes, or stops responding.

## refetch.spec.ts

Seeds a future-only class via the API, then asserts it appears in the
engagement form's options when the global date moves into its validity, is
pickable, is cleared again as a stale selection, and vanishes when the date
moves back. The class is deleted afterwards; if a crashed run leaves it
behind, its user_key is prefixed `refetch-probe-`.

## userflow.spec.ts

Fills every step of the onboarding wizard (employee, engagement, ituser with
a rolebinding, manager, address) and asserts the captured `UserFlowCreate`
variables: every detail must reference the employee's client-generated uuid,
the rolebinding must reference the ituser's, and each must carry what was
picked on its step.

## payloads.spec.ts

Records what the engagement forms would submit. Skipped unless
`PAYLOAD_LABEL` is set, and excluded from CI entirely — a skip in the CI
report therefore always means the seed is broken. Run on two refs — the `new` run diffs against the
old file; any difference must be deliberate and mentioned in the MR.

```
PAYLOAD_LABEL=old yarn e2e payloads    # on the baseline ref
git checkout <branch>
PAYLOAD_LABEL=new yarn e2e payloads    # captures and diffs against old
```
