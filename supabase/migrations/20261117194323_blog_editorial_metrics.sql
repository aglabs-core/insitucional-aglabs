create schema if not exists blog_private;
revoke all on schema blog_private from public, anon, authenticated;
create table if not exists blog_private.reads (
 post_id uuid not null references public.blog_posts(id) on delete cascade,
 day date not null default (now() at time zone 'America/Sao_Paulo')::date,
 session_id uuid not null, primary key(post_id,day,session_id)
);
alter table blog_private.reads enable row level security;
create index if not exists blog_reads_day_idx on blog_private.reads(day,post_id);
-- Public write-only endpoint; elevated privileges are limited to a published
-- post check and idempotent insertion. Raw sessions never leave the private schema.
create or replace function public.record_blog_read(p_post_id uuid,p_session_id uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 if p_session_id is null then return; end if;
 if not exists(select 1 from public.blog_posts where id=p_post_id and published) then return; end if;
 insert into blog_private.reads(post_id,session_id) values(p_post_id,p_session_id) on conflict do nothing;
end; $$;
revoke all on function public.record_blog_read(uuid,uuid) from public;
grant execute on function public.record_blog_read(uuid,uuid) to anon,authenticated;
-- Only aggregates for published posts, never visitor identifiers or comments.
create or replace function public.blog_read_stats()
returns table(post_id uuid,month_reads bigint,comments bigint)
language sql stable security definer set search_path='' as $$
 select p.id,
 (select count(*) from blog_private.reads r where r.post_id=p.id and r.day >= date_trunc('month',now() at time zone 'America/Sao_Paulo')::date),
 (select count(*) from public.blog_comments c where c.post_id=p.id)
 from public.blog_posts p where p.published;
$$;
revoke all on function public.blog_read_stats() from public;
grant execute on function public.blog_read_stats() to anon,authenticated;
comment on function public.blog_read_stats() is 'Estimated qualified sessions this calendar month; browser deduplication is not fraud protection or unique-person measurement.';
