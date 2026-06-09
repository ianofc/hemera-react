-- Migration to update gaia_chats types and allow bot/agent messages
-- 1. Update CHECK constraint on gaia_chats.tipo
ALTER TABLE public.gaia_chats DROP CONSTRAINT IF EXISTS gaia_chats_tipo_check;

ALTER TABLE public.gaia_chats ADD CONSTRAINT gaia_chats_tipo_check 
    CHECK (tipo IN ('dm', 'grupo', 'ai_zios', 'ai_iris', 'ai_tas', 'ai_mercurio', 'ai_heimdall'));

-- 2. Drop foreign key constraint on gaia_messages.sender_id referencing profiles(id)
-- so that we can insert messages sent by bot agents without requiring a row in auth.users / profiles.
ALTER TABLE public.gaia_messages DROP CONSTRAINT IF EXISTS gaia_messages_sender_id_fkey;
