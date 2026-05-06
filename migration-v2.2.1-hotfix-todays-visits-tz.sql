-- =========================================================
-- v2.2.1 HOTFIX — todays_visits timezone bug
-- =========================================================
-- BUG: The original v1 schema defined `todays_visits` view as:
--
--   where v.visited_at >= date_trunc('day', now())
--
-- `now()` on Supabase returns UTC. `date_trunc('day', utc_now)` gives
-- UTC midnight, which equals 08:00 Asia/Kuala_Lumpur. So between
-- 00:00–07:59 KL the view was showing yesterday's data, and between
-- 16:00 UTC (= 00:00 KL of the next day) onwards, "today's" view was
-- still pinned to the previous UTC date until UTC midnight rolled over.
--
-- This caused: at 00:14 KL of May 7, admin still saw May 6 23:55 visits
-- because UTC was only at 16:14 May 6, which `date_trunc('day', now())`
-- considered "the start of UTC May 6" — an entire 16-hour window of
-- yesterday's data leaked into "today".
--
-- FIX: Use KL-local midnight as the cutoff.
--
-- This script is IDEMPOTENT — safe to run anytime, even if v2.2 was
-- already applied. It rebuilds the view with the corrected logic and
-- preserves the membership column added in v2.2.
-- =========================================================

drop view if exists todays_visits cascade;

create or replace view todays_visits as
select
  v.id,
  v.visited_at,
  v.status as visit_status,
  c.id as customer_id,
  c.ic,
  c.name,
  c.phone,
  c.nationality,
  c.status as customer_status,
  c.warning_count,
  c.ban_reason,
  c.membership
from visits v
left join customers c on c.id = v.customer_id
where v.visited_at >= (
  -- Today's midnight in Asia/Kuala_Lumpur, expressed back as a UTC instant
  date_trunc('day', now() at time zone 'Asia/Kuala_Lumpur') at time zone 'Asia/Kuala_Lumpur'
)
order by v.visited_at desc;

-- =========================================================
-- Verification — at any UTC instant, this should show:
--   * KL midnight cutoff for "today"
--   * The exact UTC instant that corresponds to it
-- Should always be 16:00 UTC of the previous UTC day (or current,
-- depending on the time-of-day relative to UTC midnight).
-- =========================================================
do $$
declare
  kl_midnight_utc timestamptz;
  current_kl_time timestamp;
begin
  kl_midnight_utc := date_trunc('day', now() at time zone 'Asia/Kuala_Lumpur') at time zone 'Asia/Kuala_Lumpur';
  current_kl_time := now() at time zone 'Asia/Kuala_Lumpur';

  raise notice '✓ todays_visits view rebuilt with KL timezone';
  raise notice '  Current KL time:        %', current_kl_time;
  raise notice '  Today cutoff (UTC):     %', kl_midnight_utc;
  raise notice '  Anything >= cutoff is "today" in KL';
end $$;
