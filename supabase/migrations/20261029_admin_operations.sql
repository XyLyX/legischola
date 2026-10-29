-- LegiSchola admin operations. Private by default; application routes validate
-- server-controlled founder identity before using a service-role client.
create table if not exists public.support_cases (
 id uuid primary key default gen_random_uuid(),
 student_user_id uuid references auth.users(id) on delete set null,
 contact_name text not null check (char_length(trim(contact_name)) between 2 and 120),
 contact_email text not null check (char_length(contact_email) between 5 and 254),
 category text not null check (category in ('general','technical','account','academic','partnership','feedback','other')),
 subject text not null check (char_length(trim(subject)) between 5 and 180),
 status text not null default 'open' check (status in ('open','in_progress','waiting_for_sender','resolved')),
 source_hash text not null check (char_length(source_hash)=64),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 last_admin_reply_at timestamptz
);
create table if not exists public.support_messages (
 id uuid primary key default gen_random_uuid(),
 case_id uuid not null references public.support_cases(id) on delete cascade,
 sender_role text not null check (sender_role in ('visitor','student','staff')),
 sender_user_id uuid references auth.users(id) on delete set null,
 body text not null check (char_length(trim(body)) between 2 and 4000),
 delivery_status text not null default 'received' check (delivery_status in ('received','sending','sent','needs_review')),
 client_request_id uuid unique,
 created_at timestamptz not null default now(),
 sent_at timestamptz
);
create table if not exists public.admin_institution_replies (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.institution_requests(id) on delete cascade,
 admin_user_id uuid references auth.users(id) on delete set null,
 body text not null check (char_length(trim(body)) between 2 and 4000),
 delivery_status text not null default 'sending' check (delivery_status in ('sending','sent','needs_review')),
 client_request_id uuid unique,
 created_at timestamptz not null default now(),
 sent_at timestamptz
);
create table if not exists public.admin_activity_log (
 id uuid primary key default gen_random_uuid(),
 admin_user_id uuid references auth.users(id) on delete set null,
 action text not null,
 target_type text not null,
 target_id uuid,
 detail jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create table if not exists public.admin_daily_digests (
 report_date date not null,
 recipient_user_id uuid not null references auth.users(id) on delete cascade,
 recipient_email text not null,
 status text not null default 'sending' check (status in ('sending','sent','needs_review')),
 created_at timestamptz not null default now(),
 sent_at timestamptz,
 primary key (report_date,recipient_user_id)
);
create index if not exists support_cases_updated_idx on public.support_cases(updated_at desc);
create index if not exists support_cases_status_idx on public.support_cases(status,created_at desc);
create index if not exists support_cases_hash_idx on public.support_cases(source_hash,created_at desc);
create index if not exists support_cases_student_idx on public.support_cases(student_user_id,created_at desc);
create index if not exists support_messages_case_idx on public.support_messages(case_id,created_at);
create index if not exists admin_institution_replies_request_idx on public.admin_institution_replies(request_id,created_at);
create index if not exists admin_activity_created_idx on public.admin_activity_log(created_at desc);
alter table public.support_cases enable row level security;
alter table public.support_messages enable row level security;
alter table public.admin_institution_replies enable row level security;
alter table public.admin_activity_log enable row level security;
alter table public.admin_daily_digests enable row level security;
-- Anon/authenticated have no direct policies or grants; only verified
-- server handlers with the service_role can access these records.
revoke all on public.support_cases,public.support_messages,public.admin_institution_replies,public.admin_activity_log,public.admin_daily_digests from anon,authenticated;
grant all on public.support_cases,public.support_messages,public.admin_institution_replies,public.admin_activity_log,public.admin_daily_digests to service_role;
