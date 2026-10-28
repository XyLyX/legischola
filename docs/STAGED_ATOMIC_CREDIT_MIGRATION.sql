-- STAGED MIGRATION: review and apply before deploying API integrations.
-- Monthly free credits: 20. All changes serialize on the authenticated user's wallet.
create table if not exists public.ai_credit_wallets (
 user_id uuid primary key references auth.users(id) on delete cascade,
 period_start date not null,
 remaining integer not null check (remaining >= 0),
 updated_at timestamptz not null default now()
);
create table if not exists public.ai_credit_requests (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 request_key uuid not null,
 feature text not null check (feature in ('tutor','research')),
 credits integer not null check (credits between 1 and 10),
 status text not null check (status in ('reserved','settled','refunded')),
 created_at timestamptz not null default now(),
 unique(user_id,request_key)
);
create index if not exists ai_credit_requests_user_date on public.ai_credit_requests(user_id,created_at desc);
alter table public.ai_credit_wallets enable row level security;
alter table public.ai_credit_requests enable row level security;
revoke all on public.ai_credit_wallets from anon,authenticated;
revoke all on public.ai_credit_requests from anon,authenticated;
-- SECURITY DEFINER is narrowly scoped: caller can act only as auth.uid().
create or replace function public.legischola_credit_reserve(p_key uuid,p_feature text,p_credits integer)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare v_user uuid := (select auth.uid()); v_period date := date_trunc('month',now() at time zone 'UTC')::date; v_left integer; v_existing text;
begin
 if v_user is null or p_key is null or p_feature not in ('tutor','research') or p_credits not between 1 and 10 then raise exception 'Invalid credit request'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_user::text,0));
 select status into v_existing from public.ai_credit_requests where user_id=v_user and request_key=p_key;
 if v_existing is not null then return v_existing in ('reserved','settled'); end if;
 insert into public.ai_credit_wallets(user_id,period_start,remaining) values(v_user,v_period,20)
 on conflict(user_id) do update set period_start=excluded.period_start,remaining=20,updated_at=now()
 where public.ai_credit_wallets.period_start<>excluded.period_start;
 select remaining into v_left from public.ai_credit_wallets where user_id=v_user for update;
 if v_left<p_credits then return false; end if;
 update public.ai_credit_wallets set remaining=remaining-p_credits,updated_at=now() where user_id=v_user;
 insert into public.ai_credit_requests(user_id,request_key,feature,credits,status) values(v_user,p_key,p_feature,p_credits,'reserved');
 return true;
end; $$;
create or replace function public.legischola_credit_finish(p_key uuid,p_success boolean)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare v_user uuid := (select auth.uid()); v_row public.ai_credit_requests%rowtype; v_period date := date_trunc('month',now() at time zone 'UTC')::date;
begin
 if v_user is null or p_key is null or p_success is null then raise exception 'Invalid settlement'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_user::text,0));
 select * into v_row from public.ai_credit_requests where user_id=v_user and request_key=p_key for update;
 if not found then return false; end if;
 if v_row.status<>'reserved' then return v_row.status=case when p_success then 'settled' else 'refunded' end; end if;
 update public.ai_credit_requests set status=case when p_success then 'settled' else 'refunded' end where id=v_row.id;
 if not p_success then
  update public.ai_credit_wallets set remaining=remaining+v_row.credits,updated_at=now() where user_id=v_user and period_start=v_period;
 end if;
 return true;
end; $$;
revoke all on function public.legischola_credit_reserve(uuid,text,integer) from public,anon;
revoke all on function public.legischola_credit_finish(uuid,boolean) from public,anon;
grant execute on function public.legischola_credit_reserve(uuid,text,integer) to authenticated;
grant execute on function public.legischola_credit_finish(uuid,boolean) to authenticated;
-- Required before release: load tests for concurrency and replay, and orphaned reservation recovery.
