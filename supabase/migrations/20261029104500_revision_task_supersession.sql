-- Applied to production on 2026-10-29. Keep resolved Examiner findings from leaving stale revision activities.
alter table public.revision_tasks drop constraint if exists revision_tasks_status_check;
alter table public.revision_tasks add constraint revision_tasks_status_check check (status in ('pending','completed','superseded'));
