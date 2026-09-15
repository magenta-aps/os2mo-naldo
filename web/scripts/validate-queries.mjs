// Validates every generated GraphQL document against the running MO's schema.
// `yarn generate` does not: codegen disables NoUnusedVariables and friends, so
// a query it accepts can still be rejected by the server at runtime.
import { readFile, readdir } from "node:fs/promises"
import { join } from "node:path"
import { buildSchema, validate } from "graphql"

const SRC = "src"

const schemaUrl = (await readFile("codegen.yml", "utf8")).match(
  /^schema:\s*"([^"]+)"/m
)?.[1]
if (!schemaUrl) throw new Error("no schema url in codegen.yml")

const response = await fetch(schemaUrl)
if (!response.ok) {
  console.error(`Cannot reach ${schemaUrl} (${response.status}). Is MO running?`)
  process.exit(2)
}
const schema = buildSchema(await response.text())

const generatedFiles = async (dir) => {
  const found = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...(await generatedFiles(path)))
    else if (entry.name.endsWith(".generated.ts")) found.push(path)
  }
  return found
}

let failed = 0
for (const file of await generatedFiles(SRC)) {
  const source = await readFile(file, "utf8")
  for (const [, name, json] of source.matchAll(
    /export const (\w+Document) = (\{.+?\}) as unknown/gs
  )) {
    const errors = validate(schema, JSON.parse(json))
    for (const error of errors) {
      failed++
      console.error(`${file} ${name}: ${error.message}`)
    }
  }
}

if (failed) {
  console.error(`\n${failed} invalid document${failed === 1 ? "" : "s"}.`)
  process.exit(1)
}
console.log("All generated documents validate against the schema.")
