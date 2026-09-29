-- Portfolio Admin: Google-authenticated owner and delegated administrators.
-- Run this once in the Portfolio Admin project's SQL editor.

create schema if not exists portfolio_private;
revoke all on schema portfolio_private from public, anon;

-- Keep legacy helpers out of the exposed API surface.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

create table if not exists portfolio_private.admin_members (
  email text primary key,
  created_at timestamptz not null default now(),
  created_by uuid not null
);

alter table portfolio_private.admin_members enable row level security;
alter table portfolio_private.admin_members force row level security;
revoke all on portfolio_private.admin_members from public, anon, authenticated;

create or replace function portfolio_private.current_actor()
returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  session_id uuid;
  actor_email text;
  actor_name text;
  actor_avatar text;
  actor_role text;
begin
  if actor_id is null then
    return null;
  end if;

  begin
    session_id := nullif(auth.jwt() ->> 'session_id', '')::uuid;
  exception when invalid_text_representation then
    return null;
  end;

  if session_id is null or not exists (
    select 1
    from auth.sessions s
    where s.id = session_id and s.user_id = actor_id
  ) then
    return null;
  end if;

  select lower(u.email),
         coalesce(i.identity_data ->> 'full_name', i.identity_data ->> 'name', u.email),
         coalesce(i.identity_data ->> 'avatar_url', i.identity_data ->> 'picture')
    into actor_email, actor_name, actor_avatar
  from auth.users u
  join auth.identities i
    on i.user_id = u.id and i.provider = 'google'
  where u.id = actor_id
    and u.email_confirmed_at is not null
    and lower(i.identity_data ->> 'email') = lower(u.email)
    and coalesce((i.identity_data ->> 'email_verified')::boolean, false)
  order by i.created_at desc
  limit 1;

  if actor_email is null then
    return null;
  end if;

  if actor_email = 'hamdanamir2005@gmail.com' then
    actor_role := 'owner';
  elsif exists (
    select 1 from portfolio_private.admin_members m where m.email = actor_email
  ) then
    actor_role := 'admin';
  else
    return null;
  end if;

  return jsonb_build_object(
    'userId', actor_id,
    'email', actor_email,
    'name', actor_name,
    'avatar', actor_avatar,
    'role', actor_role
  );
end;
$$;

revoke all on function portfolio_private.current_actor() from public, anon;
grant usage on schema portfolio_private to authenticated;
grant execute on function portfolio_private.current_actor() to authenticated;

create or replace function public.portfolio_admin_session()
returns jsonb
language sql
security invoker
stable
set search_path = ''
as $$
  select portfolio_private.current_actor();
$$;

revoke all on function public.portfolio_admin_session() from public, anon;
grant execute on function public.portfolio_admin_session() to authenticated;

create or replace function portfolio_private.manage_members(
  action text default 'list',
  member_email text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor jsonb := portfolio_private.current_actor();
  normalized_email text := lower(trim(coalesce(member_email, '')));
  result jsonb;
begin
  if actor is null or actor ->> 'role' <> 'owner' then
    raise exception 'Only the owner can manage admins.' using errcode = '42501';
  end if;

  if action = 'add' then
    if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
       or length(normalized_email) > 254 then
      raise exception 'Enter a valid Google-account email.' using errcode = '22023';
    end if;
    if normalized_email <> 'hamdanamir2005@gmail.com' then
      insert into portfolio_private.admin_members (email, created_by)
      values (normalized_email, (actor ->> 'userId')::uuid)
      on conflict (email) do nothing;
    end if;
  elsif action = 'remove' then
    if normalized_email = 'hamdanamir2005@gmail.com' then
      raise exception 'The owner cannot be removed.' using errcode = '42501';
    end if;
    delete from portfolio_private.admin_members where email = normalized_email;
  elsif action <> 'list' then
    raise exception 'Unsupported admin action.' using errcode = '22023';
  end if;

  select coalesce(jsonb_agg(member order by member ->> 'role' desc, member ->> 'email'), '[]'::jsonb)
  into result
  from (
    select jsonb_build_object(
      'email', entry.email,
      'role', entry.role,
      'name', coalesce(identity.identity_data ->> 'full_name', identity.identity_data ->> 'name'),
      'avatar', coalesce(identity.identity_data ->> 'avatar_url', identity.identity_data ->> 'picture')
    ) as member
    from (
      select 'hamdanamir2005@gmail.com'::text as email, 'owner'::text as role
      union all
      select m.email, 'admin'::text from portfolio_private.admin_members m
    ) entry
    left join auth.users u on lower(u.email) = entry.email
    left join lateral (
      select i.identity_data
      from auth.identities i
      where i.user_id = u.id and i.provider = 'google'
      order by i.created_at desc
      limit 1
    ) identity on true
  ) members;

  return result;
end;
$$;

revoke all on function portfolio_private.manage_members(text, text) from public, anon;
grant execute on function portfolio_private.manage_members(text, text) to authenticated;

create or replace function public.portfolio_admin_members(
  action text default 'list',
  member_email text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select portfolio_private.manage_members(action, member_email);
$$;

revoke all on function public.portfolio_admin_members(text, text) from public, anon;
grant execute on function public.portfolio_admin_members(text, text) to authenticated;

comment on table portfolio_private.admin_members is
  'Delegated portfolio admins. The protected owner is defined in current_actor().';

create table if not exists portfolio_private.site_content (
  singleton boolean primary key default true check (singleton),
  content jsonb not null,
  revision bigint not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

alter table portfolio_private.site_content enable row level security;
alter table portfolio_private.site_content force row level security;
revoke all on portfolio_private.site_content from public, anon, authenticated;

create or replace function public.portfolio_site_content()
returns jsonb
language sql
security definer
stable
set search_path = ''
as $$
  select c.content || jsonb_build_object('revision', c.revision)
  from portfolio_private.site_content c
  where c.singleton = true;
$$;

revoke all on function public.portfolio_site_content() from public;
grant execute on function public.portfolio_site_content() to anon, authenticated;

create or replace function public.portfolio_admin_save_content(
  new_content jsonb,
  expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor jsonb := portfolio_private.current_actor();
  saved jsonb;
begin
  if actor is null then
    raise exception 'Sign in with an authorized Google account.' using errcode = '42501';
  end if;

  insert into portfolio_private.site_content (singleton, content, revision, updated_by)
  values (true, new_content - 'revision', expected_revision + 1, (actor ->> 'userId')::uuid)
  on conflict (singleton) do update
    set content = excluded.content,
        revision = portfolio_private.site_content.revision + 1,
        updated_at = now(),
        updated_by = excluded.updated_by
    where portfolio_private.site_content.revision = expected_revision
  returning content || jsonb_build_object('revision', revision) into saved;

  if saved is null then
    raise exception 'Content changed in another tab. Reload before saving.' using errcode = '40001';
  end if;
  return saved;
end;
$$;

revoke all on function public.portfolio_admin_save_content(jsonb, bigint) from public, anon;
grant execute on function public.portfolio_admin_save_content(jsonb, bigint) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  167772160,
  array['image/jpeg', 'image/png', 'image/webp', 'application/vnd.android.package-archive', 'application/octet-stream']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Portfolio admins upload media" on storage.objects;
create policy "Portfolio admins upload media"
on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio-media' and portfolio_private.current_actor() is not null);

drop policy if exists "Portfolio admins update media" on storage.objects;
create policy "Portfolio admins update media"
on storage.objects for update to authenticated
using (bucket_id = 'portfolio-media' and portfolio_private.current_actor() is not null)
with check (bucket_id = 'portfolio-media' and portfolio_private.current_actor() is not null);

drop policy if exists "Portfolio admins delete media" on storage.objects;
create policy "Portfolio admins delete media"
on storage.objects for delete to authenticated
using (bucket_id = 'portfolio-media' and portfolio_private.current_actor() is not null);
