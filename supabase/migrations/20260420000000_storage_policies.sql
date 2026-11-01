insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do nothing;

create policy "Allow public uploads"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'profile-images');

create policy "Allow public reads"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'profile-images');
