-- Future-proof paid subscription tier reporting without guessing from pricing.
-- plan_id must be set by a verified payment/subscription reconciliation step;
-- NULL is retained for all historical or unclassified provider subscriptions.
alter table public.student_subscriptions add column if not exists plan_id text;
alter table public.student_subscriptions
 add constraint student_subscriptions_verified_plan_id_check
 check (plan_id is null or plan_id in ('founding','plus','pro'));
comment on column public.student_subscriptions.plan_id is
 'Verified paid subscription plan (founding, plus, pro) from payment reconciler only; NULL means unknown, never inferred.';
