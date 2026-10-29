-- LegiSchola beta: safe multi-referral ledger attribution.
-- Codes and attributions are independent of money. All reward rows continue to
-- require independently verified first paid subscriptions from a future reconciler.
-- Existing payment and referral history is preserved; no rewards are inserted.
alter table public.reward_ledger
  add column if not exists attribution_id uuid references public.referral_attributions(id),
  add column if not exists reward_programme text,
  add column if not exists qualifying_event_id uuid references public.payment_events(id);
alter table public.reward_ledger
  drop constraint if exists reward_ledger_reward_programme_check;
alter table public.reward_ledger
  add constraint reward_ledger_reward_programme_check
  check (reward_programme is null or reward_programme in
    ('founder_cash','standard_referrer','referred_welcome'));
-- Legacy indexes incorrectly allow only ONE credit per beneficiary forever and
-- only ONE ledger line per payment. A first paid conversion may correctly create
-- referrer and referred-student credits; subsequent referrer referrals also count.
drop index if exists public.referral_one_reward_per_referred;
drop index if exists public.reward_one_per_payment;
create unique index if not exists reward_unique_attribution_programme
  on public.reward_ledger(attribution_id,reward_programme)
  where attribution_id is not null and reward_programme is not null;
create unique index if not exists reward_unique_payment_recipient_programme
  on public.reward_ledger(source_payment_id,beneficiary_user_id,reward_programme)
  where source_payment_id is not null and reward_programme is not null;
create index if not exists reward_by_beneficiary_and_status
  on public.reward_ledger(beneficiary_user_id,status,created_at desc);
create index if not exists referral_attributions_by_referrer
  on public.referral_attributions(referrer_user_id,created_at desc);
