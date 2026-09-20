/**
 * Lightweight schema-builder checks using Node's built-in test runner.
 * Run: npm test
 */
import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";

function createFieldSchema(field) {
  let schema;

  switch (field.type) {
    case "text":
      schema = z.string();
      if (field.validation?.pattern) {
        schema = schema.regex(new RegExp(field.validation.pattern));
      }
      break;
    case "number":
      schema = z.number();
      if (field.validation?.min !== undefined) schema = schema.min(field.validation.min);
      if (field.validation?.max !== undefined) schema = schema.max(field.validation.max);
      break;
    case "date":
      schema = z.date();
      break;
    case "select":
    case "radio":
    case "checkbox":
      schema = z.string();
      break;
    default:
      return null;
  }

  if (!field.required) schema = schema.optional();
  return schema;
}

function generateZodSchema(fields) {
  const schemaMap = {};
  for (const field of fields) {
    if (field.type === "group" && field.fields) {
      const nested = {};
      for (const sub of field.fields) {
        const s = createFieldSchema(sub);
        if (s) nested[sub.id] = s;
      }
      schemaMap[field.id] = z.object(nested);
    } else {
      const s = createFieldSchema(field);
      if (s) schemaMap[field.id] = s;
    }
  }
  return z.object(schemaMap);
}

const fields = [
  {
    id: "full_name",
    label: "Full name",
    type: "text",
    required: true,
    validation: { pattern: "^[A-Za-z ]+$" },
  },
  {
    id: "age",
    label: "Age",
    type: "number",
    required: true,
    validation: { min: 18, max: 80 },
  },
  {
    id: "city",
    label: "City",
    type: "select",
    required: false,
    options: ["Tehran", "Paris"],
  },
];

test("accepts valid application values", () => {
  const schema = generateZodSchema(fields);
  const parsed = schema.safeParse({
    full_name: "Reza Karbakhsh",
    age: 28,
    city: "Tehran",
  });
  assert.equal(parsed.success, true);
});

test("rejects bad pattern and age range", () => {
  const schema = generateZodSchema(fields);
  const parsed = schema.safeParse({
    full_name: "Reza123",
    age: 10,
  });
  assert.equal(parsed.success, false);
});

test("optional fields can be omitted", () => {
  const schema = generateZodSchema(fields);
  const parsed = schema.safeParse({
    full_name: "Ada Lovelace",
    age: 36,
  });
  assert.equal(parsed.success, true);
});

test("nested group fields validate", () => {
  const schema = generateZodSchema([
    {
      id: "personal_info",
      label: "Personal",
      type: "group",
      fields: [
        { id: "first_name", label: "First", type: "text", required: true },
        { id: "age", label: "Age", type: "number", required: true, validation: { min: 0, max: 120 } },
      ],
    },
  ]);
  const ok = schema.safeParse({ personal_info: { first_name: "Sam", age: 30 } });
  const bad = schema.safeParse({ personal_info: { first_name: "Sam", age: 200 } });
  assert.equal(ok.success, true);
  assert.equal(bad.success, false);
});

test("required text cannot be empty", () => {
  const schema = generateZodSchema(fields);
  const parsed = schema.safeParse({ full_name: "", age: 28 });
  assert.equal(parsed.success, false);
});
