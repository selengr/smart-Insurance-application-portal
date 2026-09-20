/**
 * Status pipeline helpers — mirrors src/lib/local-applications.ts
 * Run: npm test
 */
import assert from "node:assert/strict"
import test from "node:test"

const STATUS_FLOW = ["Pending", "In Review", "Approved"]

function nextStatus(current) {
  const index = STATUS_FLOW.indexOf(current)
  if (index < 0 || index >= STATUS_FLOW.length - 1) return null
  return STATUS_FLOW[index + 1]
}

function summarizeStatuses(apps) {
  return apps.reduce(
    (acc, row) => {
      const key = String(row.Status ?? "Pending")
      if (key === "Pending") acc.pending += 1
      else if (key === "In Review") acc.inReview += 1
      else if (key === "Approved") acc.approved += 1
      else if (key === "Rejected") acc.rejected += 1
      else acc.other += 1
      return acc
    },
    { pending: 0, inReview: 0, approved: 0, rejected: 0, other: 0, total: apps.length },
  )
}

test("nextStatus walks Pending → In Review → Approved", () => {
  assert.equal(nextStatus("Pending"), "In Review")
  assert.equal(nextStatus("In Review"), "Approved")
  assert.equal(nextStatus("Approved"), null)
  assert.equal(nextStatus("Rejected"), null)
})

test("summarizeStatuses counts pipeline buckets", () => {
  const summary = summarizeStatuses([
    { Status: "Pending" },
    { Status: "Pending" },
    { Status: "In Review" },
    { Status: "Approved" },
    { Status: "Rejected" },
  ])
  assert.equal(summary.pending, 2)
  assert.equal(summary.inReview, 1)
  assert.equal(summary.approved, 1)
  assert.equal(summary.rejected, 1)
  assert.equal(summary.total, 5)
})
