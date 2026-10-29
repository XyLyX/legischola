-- Applied to Supabase ztfjrjviejtxubwvixsf on 2026-10-29.
-- Student-owned revision evidence, generated activities, and personal scheduling preferences.
create table if not exists public.revision_inferences (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 curriculum_unit_id uuid not null references public.curriculum_units(id) on delete cascade,
 semester integer not null check (semester between 1 and 10),
 subject_code text not null,
 source_attempt_id uuid references public.study_assessment_attempts(id) on delete set null,
 source_type text not null check (source_type in ('assessment','progress','diagnostic','reassessment')),
 concept text not null check (length(concept) between 1 and 150),
 finding text not null,
 score integer check (score between 0 and 10),
 priority integer not null default 2 check (priority between 1 and 3),
 status text not null default 'open' check (status in ('open','improving','resolved')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists revision_inference_attempt_concept_unique on public.revision_inferences(user_id,source_attempt_id,concept) where source_attempt_id is not null;
create index if not exists revision_inferences_student_semester_idx on public.revision_inferences(user_id,semester,status);
create table if not exists public.revision_tasks (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 inference_id uuid references public.revision_inferences(id) on delete set null,
 curriculum_unit_id uuid not null references public.curriculum_units(id) on delete cascade,
 semester integer not null check (semester between 1 and 10),
 subject_code text not null,
 title text not null,
 activity_type text not null check (activity_type in ('concept_review','application_practice','recall','reassessment')),
 instructions text not null,
 priority integer not null default 2 check (priority between 1 and 3),
 status text not null default 'pending' check (status in ('pending','completed')),
 due_at timestamptz not null default now(),
 completed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists revision_task_inference_activity_unique on public.revision_tasks(inference_id,activity_type) where inference_id is not null;
create index if not exists revision_tasks_student_semester_idx on public.revision_tasks(user_id,semester,status,due_at);
create table if not exists public.revision_preferences (
 user_id uuid not null references auth.users(id) on delete cascade,
 semester integer not null check (semester between 1 and 10),
 minutes_per_day integer not null default 30 check (minutes_per_day between 10 and 240),
 exam_date date,
 updated_at timestamptz not null default now(),
 primary key(user_id,semester)
);
alter table public.revision_inferences enable row level security;
alter table public.revision_tasks enable row level security;
alter table public.revision_preferences enable row level security;
revoke all on public.revision_inferences,public.revision_tasks,public.revision_preferences from anon;
grant select on public.revision_inferences,public.revision_tasks to authenticated;
grant select,insert,update on public.revision_preferences to authenticated;
create policy "student reads own revision inferences" on public.revision_inferences for select to authenticated using ((select auth.uid())=user_id);
create policy "student reads own revision tasks" on public.revision_tasks for select to authenticated using ((select auth.uid())=user_id);
create policy "student reads own revision preferences" on public.revision_preferences for select to authenticated using ((select auth.uid())=user_id);
create policy "student creates own revision preferences" on public.revision_preferences for insert to authenticated with check ((select auth.uid())=user_id);
create policy "student updates own revision preferences" on public.revision_preferences for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
