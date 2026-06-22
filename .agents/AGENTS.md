# ACOB Website — Agent Standards

## Chatbot Route Integrity

The website chatbot (`/api/chat`) must know about every public-facing route so it can answer user navigation questions accurately.

### Rule: Every new page route must be added to the system prompt

Whenever you add a new public route to the website, you **must** also add it to the `WEBSITE NAVIGATION & ROUTES` section in:

```
lib/data/acobot_system_prompt.ts
```

Include:

- The human-readable name (e.g. "Company Profile")
- The route path (e.g. `/about/profile`)
- The correct section group (Main Pages, About Section, Services, Contact, Updates, etc.)

### Rule: Every new static data source must be reflected in the system prompt

If a new page contains key factual data (e.g. a new partner, a new office, a new product category, a new team member), update the relevant section of the system prompt with a summary of that data so the chatbot can answer questions about it.

### Rule: Do not leave knowledge gaps

If you build a page the chatbot cannot navigate to or answer questions about, you have created a knowledge gap. Users who ask the chatbot about that page will get a wrong or unhelpful answer.

### Partners data

The full partner list is in `lib/data/partners-data.ts`. When adding a new partner:

1. Add the partner to `partners-data.ts` (following the existing schema)
2. Add the partner's name, category, and a one-line description to the **PARTNERS & STRATEGIC RELATIONSHIPS** section in `acobot_system_prompt.ts`

---

## TypeScript & Linting

- Run `npx tsc --noEmit` before committing.
- All staged files must pass `eslint --fix` (enforced by lint-staged in pre-commit hook).
- Do not introduce `any` types. Use narrow local interfaces.

## Commit Message Standard

Format: `type: description` (lowercase, max 72 chars)

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`
