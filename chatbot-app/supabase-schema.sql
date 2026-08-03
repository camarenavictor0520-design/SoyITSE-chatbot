-- Ejecuta esto en el SQL Editor de tu proyecto Supabase (https://app.supabase.com)

-- Tabla de conversaciones (una fila por chat en el historial)
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text default 'Nueva conversación',
  created_at timestamptz default now()
);

-- Tabla de mensajes dentro de cada conversación
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  image_url text,
  created_at timestamptz default now()
);

-- Row Level Security: cada usuario solo ve sus propios datos
alter table conversations enable row level security;
alter table messages enable row level security;

create policy "Los usuarios ven sus propias conversaciones"
  on conversations for select using (auth.uid() = user_id);
create policy "Los usuarios crean sus propias conversaciones"
  on conversations for insert with check (auth.uid() = user_id);
create policy "Los usuarios borran sus propias conversaciones"
  on conversations for delete using (auth.uid() = user_id);

create policy "Los usuarios ven mensajes de sus conversaciones"
  on messages for select using (
    exists (select 1 from conversations c where c.id = conversation_id and c.user_id = auth.uid())
  );
create policy "Los usuarios insertan mensajes en sus conversaciones"
  on messages for insert with check (
    exists (select 1 from conversations c where c.id = conversation_id and c.user_id = auth.uid())
  );

-- Bucket de almacenamiento para imágenes subidas al chat
insert into storage.buckets (id, name, public) values ('chat-images', 'chat-images', true)
  on conflict (id) do nothing;

create policy "Cualquiera puede ver imágenes del chat"
  on storage.objects for select using (bucket_id = 'chat-images');
create policy "Usuarios autenticados suben imágenes"
  on storage.objects for insert with check (bucket_id = 'chat-images' and auth.role() = 'authenticated');
