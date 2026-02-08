# Audit Codebase

Verify that all `.claude` prompts, commands, agents, and CLAUDE.md accurately reflect the actual codebase.

## Arguments
- $ARGUMENTS: (optional) Specific area to audit, e.g., "commands only" or "CLAUDE.md". If empty, audit everything.

## Instructions

1. **Read the actual codebase** to establish ground truth:
   - List all files under `src/` to get the real directory structure
   - Read `package.json` for actual dependency versions
   - Read `src/types/index.ts` for actual type definitions
   - Read `src/lib/utils.ts` for actual utility functions
   - Read `src/store/*.ts` for actual state management
   - Read `src/services/*.ts` for actual data access functions
   - Read `src/data/*.ts` for actual data files
   - Check which files are empty stubs vs actual implementations

2. **Read all `.claude` configuration**:
   - `CLAUDE.md` — project overview and conventions
   - `.claude/commands/*.md` — all slash commands
   - `.claude/agents/*.md` — all agent workflows
   - `.claude/settings.json` — permissions
   - `.claude/mcp.json` — MCP server config

3. **Compare and identify discrepancies** in these categories:

   ### File References
   - Do file paths mentioned in prompts actually exist?
   - Are any real files missing from the documentation?
   - Are empty stub files correctly identified as stubs?

   ### Function/API References
   - Do referenced functions actually exist? (e.g., `calculateModifiersCost`, `fetchMenu`)
   - Are function signatures correct? (parameter names and types)
   - Are referenced stores, hooks, and utilities accurate?

   ### Architecture Description
   - Does the described architecture match reality? (e.g., Supabase vs localStorage)
   - Are data flow diagrams accurate?
   - Are tech stack versions correct? (Next.js, React, etc.)

   ### Convention Accuracy
   - Do stated conventions match actual code patterns?
   - Are currency symbols correct? (€ vs £)
   - Are price unit descriptions correct? (cents vs pence)

   ### Command/Agent Accuracy
   - Do commands reference correct files and patterns?
   - Do agent workflows describe valid processes for current architecture?
   - Are test suites testing features that actually exist?

4. **Report findings** as a structured list:
   ```
   ## Audit Results

   ### Critical (wrong information that would cause errors)
   - [file]: [description of issue]

   ### Warning (outdated but not immediately harmful)
   - [file]: [description of issue]

   ### Suggestion (improvements or missing coverage)
   - [file]: [description of suggestion]

   ### Verified OK
   - [file]: [what was verified]
   ```

5. **Fix any issues found** by updating the affected files.

6. **Verify the build** still passes after any changes: `npm run build`
