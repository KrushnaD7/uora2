# Prisma migrations for UORA

This project previously had NO `prisma/migrations` directory — schema changes
were applied with `prisma db push`, which has no reviewable history and can
silently drop/recreate columns.

**The baseline migration (`0_init/migration.sql`) is already generated** —
it was produced with `prisma migrate diff --from-empty --to-schema-datamodel`
against the real schema (21 tables, 25 foreign keys, matching every model in
`schema.prisma`). You still need to run ONE command against your real
production database to tell Prisma "this is already applied, don't try to
run it":

```bash
cd backend

# Tell Prisma this migration is ALREADY applied in production — this does
# NOT run the SQL (your tables already exist), it just records the baseline
# so future `migrate deploy` calls only apply what's genuinely new. Run this
# against your real production DATABASE_URL (from a machine that can reach
# it — your own machine, or Hostinger's terminal if it offers one):
npx prisma migrate resolve --applied 0_init
```

After that, every future schema change goes through:

```bash
npx prisma migrate dev --name <describe-the-change>   # locally, creates a new migration file
git add prisma/migrations && git commit -m "..."
# ...then in production/CI:
npx prisma migrate deploy                              # applies only pending migrations, never resets data
```

`backend/package.json`'s `build` script only runs `prisma generate` (types
only, safe) — it deliberately does **not** run `migrate deploy` automatically
as part of `build`, so a build never touches production data by accident.
Run `npm run prisma:deploy` as an explicit, separate step in your deploy
process (see root `DEPLOY.md`).

**Never** use `prisma db push` against production again once you've run the
`resolve --applied` step above.
