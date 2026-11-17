create or replace function public.blog_read_stats()
returns table(post_id uuid,month_reads bigint,comments bigint)
language sql stable security definer set search_path='' as $$
 select p.id,
 (select count(*) from blog_private.reads r where r.post_id=p.id and r.day >= date_trunc('month',now() at time zone 'America/Sao_Paulo')::date),
 (select count(*) from public.blog_comments c where c.post_id=p.id)
 from public.blog_posts p
 where p.published and exists(select 1 from public.admin_users a where a.id=(select auth.uid()));
$$;
revoke all on function public.blog_read_stats() from public,anon,authenticated;
grant execute on function public.blog_read_stats() to authenticated;
create or replace function public.blog_popular_posts()
returns table(post_id uuid)
language sql stable security definer set search_path='' as $$
 select p.id from public.blog_posts p join blog_private.reads r on r.post_id=p.id
 where p.published and r.day >= date_trunc('month',now() at time zone 'America/Sao_Paulo')::date
 group by p.id order by count(*) desc,p.id limit 6;
$$;
revoke all on function public.blog_popular_posts() from public;
grant execute on function public.blog_popular_posts() to anon,authenticated;
comment on function public.blog_popular_posts() is 'Public ranking of published post IDs only. Counts remain admin-only.';
