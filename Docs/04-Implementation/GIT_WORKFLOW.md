# Git Workflow

## Branches
- `main`: stable, reviewed code.
- `develop`: integrated development branch.
- `feature/<short-name>`: feature work.
- `fix/<short-name>`: bug fixes.

## Workflow
1. Create or select a GitHub issue.
2. Create a feature branch from `develop`.
3. Make small, focused commits.
4. Run tests and checks locally.
5. Open a pull request.
6. Review changes and resolve feedback.
7. Merge into `develop`.
8. Promote a tested release to `main`.

## Commit message examples
- `feat(appointments): add appointment request endpoint`
- `fix(auth): reject expired sessions`
- `test(followups): cover reminder retry handling`
- `docs(srs): clarify appointment approval workflow`

Never commit `.env` files, private keys, real patient data, database dumps, or uploaded medical images.
