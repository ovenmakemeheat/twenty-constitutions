# React Router + shadcn/ui

This is a template for a new React Router project with React, TypeScript, and shadcn/ui.

## Git hooks

This repo uses `lefthook` to run Prettier on staged files before each commit
and `commitlint` to enforce a single-line commit convention.

Install dependencies to set up hooks automatically:

```bash
bun install
```

Valid commit messages:

```text
feat: add constitution card
fix: align header spacing
docs: update setup steps
```

Invalid commit messages:

```text
feat(ui): add constitution card
feat: add constitution card

details are not allowed here
```

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```
