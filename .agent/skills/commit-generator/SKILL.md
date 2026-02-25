---
name: commit-generator
description: Generates commit messages following Nereodata standards (Conventional Commits + Phase/Block prefix)
---

# Commit Generator Skill

This skill ensures every commit follows the strict standards defined in `.cursorrules`.

## Workflow

1. **Analyze Activity**:
   - Check which files were modified.
   - Summarize the technical changes (logic, UI, docs, etc.).

2. **Locate Context**:
   - Read `docs/plan/Plan de Ejecución - Fase 2.md`.
   - Identify the **Bloque** and **Sub-bloque** currently being worked on.
   - If the task is not in the plan, use a general scope but prefer logical blocks.

3. **Determine Metadata**:
   - **Type**: `docs`, `feat`, `fix`, `refactor`, `test`, `chore`, `style`, `perf`.
   - **Scope**: `plan`, `config`, `api`, `ui`, `backend`, `frontend`.
   - **Prefix**: `<phase>.<block>.<subblock>` (e.g., `2.0.1`).

4. **Identify Requirements**:
   - Look for `Ref: RF-XXX` or `RNF-XXX` in the modified files or task context.

5. **Generate Message**:
   - Mandatory format: `<type>(<scope>): <phase>.<block>.<subblock> - <subject>`
   - Language: **English**.
   - Body: Detailed description.
   - Footer: References.

## Example

```text
feat(ui): 2.3.1 - add presentation status indicator in Sidebar

Implementing a reactive status chip in the main sidebar using Zustand store.
The chip updates in real-time based on the generation progress.

Ref: RF-204, RNF-012
```

## Mandatory Checks
- Is the language English?
- Does it have the phase.block.subblock prefix?
- Does it use a valid type and scope?
- Does it include references if applicable?
