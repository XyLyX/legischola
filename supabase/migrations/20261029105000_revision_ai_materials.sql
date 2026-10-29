-- Applied to Supabase on 2026-10-29: store generated personalised revision packs per student task.
alter table public.revision_tasks add column if not exists material text;
