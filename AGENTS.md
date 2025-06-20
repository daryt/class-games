# Codex Agent Instructions

This repository contains a React application written in TypeScript and built with Vite. Some basic conventions are used throughout the codebase.

## Coding style

- Format code with **Prettier** using the default rules. Run `npx prettier --write <files>` on any file you modify.
- Use 2 spaces for indentation.
- Prefer double quotes for strings.
- Implement React components and hooks as arrow functions.
- Keep TypeScript `interface` definitions for props and complex data shapes.

## Programmatic checks

Before committing changes, make a best effort to run:

```bash
npx prettier --write <files changed>
yarn build
```

If you add dependencies, run `yarn` first and commit the updated `yarn.lock`.

`yarn build` validates the TypeScript compilation and builds the production bundle.
