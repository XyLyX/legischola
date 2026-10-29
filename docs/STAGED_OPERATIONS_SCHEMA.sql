-- STAGING ONLY: review against production schema before applying.
-- Internal telemetry is server-only; no client role is granted access.
create schema if not exists legischola_ops;
create table if not exists legischola_ops.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  request_id text not null unique,
  student_id uuid references auth.users(id) on delete set null,
  feature text not null,
  route text not null,
  plan_id text,
  plan_version text,
  provider text,
  model text,
  model_version text,
  input_tokens bigint not null default 0 check(input_tokens>=0),
  output_tokens bigint not null default 0 check(output_tokens>=0),
  cache_read_tokens bigint not null default 0 check(cache_read_tokens>=0),
  cache_write_tokens bigint not null default 0 check(cache_write_tokens>=0),
  estimated_cost_minor bigint check(estimated_cost_minor>=0),
  settled_cost_minor bigint check(settled_cost_minor>=0),
  cost_currency text not null default 'USD',
  price_snapshot jsonb not null default '{}'::jsonb,
  fx_snapshot jsonb not null default '{}'::jsonb,
  reserved_credits integer not null default 0,
  settled_credits integer not null default 0,
  refunded_credits integer not null default 0,
  status text not null check(status in ('reserved','succeeded','failed','refunded','reconciled')),
  latency_ms integer,
  retry_count integer not null default 0,
  correlation_id text,
  invoice_reference text,
  created_at timestamptz not null default now(),
  settled_at timestamptz
);
create index if not exists ai_usage_events_student_date on legischola_ops.ai_usage_events(student_id,created_at desc);
create index if not exists ai_usage_events_feature_date on legischola_ops.ai_usage_events(feature,created_at desc);
create table if not exists legischola_ops.wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete restrict,
  idempotency_key text not null unique,
  kind text not null check(kind in ('grant','reserve','settle','release','purchase','expire','adjust','refund')),
  bucket text not null check(bucket in ('trial','subscription','purchased')),
  delta_credits integer not null,
  source_reference text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists wallet_ledger_student_date on legischola_ops.wallet_ledger(student_id,created_at desc);
create table if not exists legischola_ops.feature_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  feature text not null,
  session_id uuid,
  cohort text,
  subject_id text,
  event_at timestamptz not null default now()
);
create index if not exists feature_events_date on legischola_ops.feature_events(event_at desc,feature);
create table if not exists legischola_ops.provider_costs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  service text not null,
  billing_period_start date not null,
  billing_period_end date not null,
  currency text not null,
  invoice_cost_minor bigint,
  internal_estimate_minor bigint,
  reconciliation_status text not null default 'pending',
  invoice_reference text,
  captured_at timestamptz not null default now()
);
create table if not exists legischola_ops.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) on delete set null,
  request_type text not null check(request_type in ('access','correction','deletion','withdrawal','grievance','nomination')),
  status text not null default 'received',
  verified_at timestamptz,
  requested_at timestamptz not null default now(),
  closed_at timestamptz,
  retention_exception_note text
);
alter table legischola_ops.ai_usage_events enable row level security;
alter table legischola_ops.wallet_ledger enable row level security;
alter table legischola_ops.feature_events enable row level security;
alter table legischola_ops.provider_costs enable row level security;
alter table legischola_ops.privacy_requests enable row level security;
revoke all on schema legischola_ops from anon,authenticated;
revoke all on all tables in schema legischola_ops from anon,authenticated;
-- Before production: verify server-side roles, atomic reservation functions,
-- GDPR/DPDP retention, erasure exceptions, and backup lifecycle.
