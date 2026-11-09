# AI-Assisted Development Workflow

## Roles

### Ahana — Game Creator / Creative Director
- Chooses characters, worlds, visual themes and gameplay ideas.
- Reviews screenshots and playable builds.
- Approves child-facing wording, character art direction and game feel.
- Does not need to handle account credentials, app signing or public release operations.

### Parent / Project Owner
- Owns repository access, security settings, dependency review and releases.
- Reviews generated code and any external service/SDK additions.
- Manages app-store accounts, privacy disclosures, signing keys and publication.
- Keeps credentials and secrets out of source code and prompts.

### AI assistants
- **Design assistant:** turns Ahana's ideas into user stories, art briefs and acceptance criteria.
- **Development assistant:** proposes small code changes with tests and explanation.
- **QA assistant:** derives test cases, reviews diffs and checks edge cases.

AI output is a proposal, not an automatic approval. A human reviews every code change before merging.

## Working loop

1. Select one small milestone task.
2. Write the expected behavior and acceptance criteria in an issue.
3. Ask the development assistant for a focused implementation plan.
4. Implement on a feature branch.
5. Run type-check, unit tests, E2E tests as applicable, and production build.
6. Review changed files and dependency/security implications.
7. Ask Ahana to review the visible game behavior when the task affects the experience.
8. Merge only after parent review.

## Prompt template

```text
You are contributing to Magic Maze Adventure, a Phaser 3 + TypeScript game.
Read the relevant documentation first.
Implement only the requested task.
Do not change approved game decisions without asking.
Keep domain logic testable and separate from Phaser rendering.
Add or update tests for behavior changes.
Do not add analytics, ads, purchases, online accounts, chat, location access,
photo uploads, or third-party SDKs.
Explain files changed, decisions made, and commands/tests run.
```

## Repository hygiene

- Never commit access tokens, passwords, signing keys, personal data or private player save data.
- Keep dependencies minimal and inspect new packages before adoption.
- Use pull requests for significant changes.
- Keep commits small and descriptive.
- Use original or appropriately licensed images, audio and fonts.
- Do not paste private credentials or personal information into AI tools.
