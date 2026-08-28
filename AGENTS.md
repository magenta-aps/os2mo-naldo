# Working in this repo

Guidance for AI agents and new contributors. Keep it short; details live
next to the code they describe.

## Dev environment

- `docker compose up -d` — frontend on `localhost:5173`
- Local MO + Keycloak on `localhost:5000` (separate repo); dev login `bruce`/`bruce`
- `yarn generate` regenerates GraphQL types against the running MO. Only
  commit the generated changes your query edits caused — discard unrelated
  schema drift in `src/lib/graphql/types.ts`.

## Verification

- `yarn test` — unit tests (CI runs these on every push)
- `yarn verify` — unit tests plus the e2e suite in `web/e2e/README.md`.
  CI runs the same e2e suite on every MR against a MO spun up in the
  pipeline, so the pipeline is the gate. Agents run `yarn verify` locally
  before pushing changes to forms or shared form components anyway — it is
  much faster than waiting for the pipeline.
- Form rewrites additionally run the payload capture on both refs
  (`PAYLOAD_LABEL=old|new yarn e2e payloads`); the diff goes in the MR
  description.

## Conventions

- Commits: `type: [#ticket] message`, `[#xxxxx]` when there is no ticket.
  No `Co-Authored-By` trailers.
- On MR branches, fold fixes into their introducing commits
  (`git commit --fixup` + `git rebase -i --autosquash`) instead of appending
  fix commits.
- Comments state constraints the code cannot show — not history, not
  narration of the next line.

## Form footguns

- Never assign a `bind:value` select variable in a reactive statement
  (`$: chosenThing = ...`). Svelte compiles the binding into a
  dependency-invalidating update that loops forever and freezes the page.
  Preselect with `startValue` instead.
- While a Select's options load, pass `iterable={undefined}` — an empty
  array clears a prefilled selection.
- Never seed a Select value with an empty name (`{ uuid, name: "" }`) — the
  component drops it. Fall back to the uuid when a name does not resolve.
- Data fetching in forms goes through `createQuery` (`$lib/http/query.ts`);
  the employee edit engagement form is the reference implementation.
- GraphQL v29 `validity.to` is exclusive: `to == date` means it ended the
  day before.
