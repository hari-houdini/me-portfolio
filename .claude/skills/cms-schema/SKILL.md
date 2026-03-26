---
name: cms-schema
description: Validate that a Zod schema in app/services/cms matches the corresponding Payload collection or global definition. Use when adding or changing CMS fields.
argument-hint: <collection-or-global-name>
disable-model-invocation: true
---

# CMS Schema Alignment Validator

Compare the Payload CMS field definition with its corresponding Zod schema and report any mismatches.

## Steps

1. Locate the Payload definition for `$ARGUMENTS`:
   - Collection: `cms/src/collections/<Name>.ts`
   - Global: `cms/src/globals/<Name>.ts`
   Read the file and extract every field: name, type, required/optional, and sub-fields.

2. Locate the Zod schema:
   - `app/services/cms/cms.schemas.ts`
   Find the schema corresponding to `$ARGUMENTS` (e.g., `ProjectSchema`, `AboutSchema`, `ContactSchema`).

3. Compare field by field and produce a report table:

   ```
   Field         | Payload type          | Zod type              | Status
   title         | text (required)       | z.string()            | ✅ Match
   status        | select (draft/pub)    | z.string()            | ⚠️  Zod too broad — use z.enum(["draft","published"])
   thumbnail     | upload → Media        | z.object({url:...})   | ✅ Match
   tags          | array of {tag:string} | z.string[]            | ❌ Mismatch — needs union transform
   ```

4. For each ❌ mismatch or ⚠️ warning:
   - Explain the consequence (runtime parse failures, type unsafety)
   - Propose the exact Zod fix

5. Ask: "Should I apply these fixes to `cms.schemas.ts`?" before making any changes.

## Payload array-of-objects pattern
Payload's `array` field type wraps items: `[{id: "abc", tag: "React"}]`.
The Zod union transform handles both shapes:
```typescript
const payloadTagArray = (field: string) =>
  z.union([
    z.array(z.string()),
    z.array(z.object({ id: z.string().optional(), [field]: z.string() }))
      .transform(arr => arr.map(item => item[field])),
  ]);
```
Use this helper for any Payload `array` field.
