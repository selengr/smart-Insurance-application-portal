/**
 * Import / recent helpers — mirrors src/lib/local-applications.ts behavior
 */
import assert from "node:assert/strict"
import test from "node:test"

function normalizeImport(incoming) {
  if (!Array.isArray(incoming)) throw new Error("Invalid import payload")
  const normalized = incoming.filter(
    (row) => row && typeof row === "object" && typeof row.id === "string" && row.id.length > 0,
  )
  return {
    imported: normalized.length,
    skipped: incoming.length - normalized.length,
  }
}

test("import counts valid rows and skips junk", () => {
  const result = normalizeImport([
    { id: "a1", Status: "Pending" },
    { nope: true },
    null,
    { id: "a2" },
  ])
  assert.equal(result.imported, 2)
  assert.equal(result.skipped, 2)
})

test("import rejects non-arrays", () => {
  assert.throws(() => normalizeImport({ id: "x" }), /Invalid import payload/)
})
