-- ==============================================================================
-- SUPABASE ROW-LEVEL SECURITY (RLS) FIX SCRIPT (SAFE & DYNAMIC)
-- ==============================================================================
-- Instructions:
-- 1. Log into your Supabase Dashboard (https://supabase.com/dashboard).
-- 2. Select your project ("Immersation").
-- 3. Click on "SQL Editor" in the left sidebar menu.
-- 4. Paste this entire script into the query editor and click "Run".
-- ==============================================================================

-- STEP 1: Enable Row Level Security (RLS) on ALL tables that currently exist in public schema
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
    END LOOP;
END $$;

-- STEP 2: Dynamically configure policies ONLY for tables that exist in your database

DO $$
BEGIN
    ----------------------------------------------------------------------------
    -- 1. Products Table
    ----------------------------------------------------------------------------
    IF (to_regclass('public.products') IS NOT NULL) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Public Read Access Products" ON public.products;';
        EXECUTE 'DROP POLICY IF EXISTS "Admin Full Access Products" ON public.products;';
        EXECUTE 'CREATE POLICY "Public Read Access Products" ON public.products FOR SELECT USING (true);';
        EXECUTE 'CREATE POLICY "Admin Full Access Products" ON public.products FOR ALL USING (auth.role() = ''authenticated'');';
    END IF;

    ----------------------------------------------------------------------------
    -- 2. Articles Table
    ----------------------------------------------------------------------------
    IF (to_regclass('public.articles') IS NOT NULL) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Public Read Access Articles" ON public.articles;';
        EXECUTE 'DROP POLICY IF EXISTS "Admin Full Access Articles" ON public.articles;';
        EXECUTE 'CREATE POLICY "Public Read Access Articles" ON public.articles FOR SELECT USING (true);';
        EXECUTE 'CREATE POLICY "Admin Full Access Articles" ON public.articles FOR ALL USING (auth.role() = ''authenticated'');';
    END IF;

    ----------------------------------------------------------------------------
    -- 3. Newsletters Table
    ----------------------------------------------------------------------------
    IF (to_regclass('public.newsletters') IS NOT NULL) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Public Read Access Newsletters" ON public.newsletters;';
        EXECUTE 'DROP POLICY IF EXISTS "Admin Full Access Newsletters" ON public.newsletters;';
        EXECUTE 'CREATE POLICY "Public Read Access Newsletters" ON public.newsletters FOR SELECT USING (true);';
        EXECUTE 'CREATE POLICY "Admin Full Access Newsletters" ON public.newsletters FOR ALL USING (auth.role() = ''authenticated'');';
    END IF;

    ----------------------------------------------------------------------------
    -- 4. Newsletter Subscriptions Table
    ----------------------------------------------------------------------------
    IF (to_regclass('public.newsletter_subscriptions') IS NOT NULL) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Public Insert Subscriptions" ON public.newsletter_subscriptions;';
        EXECUTE 'DROP POLICY IF EXISTS "Admin Full Access Subscriptions" ON public.newsletter_subscriptions;';
        EXECUTE 'CREATE POLICY "Public Insert Subscriptions" ON public.newsletter_subscriptions FOR INSERT WITH CHECK (true);';
        EXECUTE 'CREATE POLICY "Admin Full Access Subscriptions" ON public.newsletter_subscriptions FOR ALL USING (auth.role() = ''authenticated'');';
    END IF;

    ----------------------------------------------------------------------------
    -- 5. Book Chapters Table
    ----------------------------------------------------------------------------
    IF (to_regclass('public.book_chapters') IS NOT NULL) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Public Read Access Book Chapters" ON public.book_chapters;';
        EXECUTE 'DROP POLICY IF EXISTS "Admin Full Access Book Chapters" ON public.book_chapters;';
        EXECUTE 'CREATE POLICY "Public Read Access Book Chapters" ON public.book_chapters FOR SELECT USING (true);';
        EXECUTE 'CREATE POLICY "Admin Full Access Book Chapters" ON public.book_chapters FOR ALL USING (auth.role() = ''authenticated'');';
    END IF;

    ----------------------------------------------------------------------------
    -- 6. Purchases Table
    ----------------------------------------------------------------------------
    IF (to_regclass('public.purchases') IS NOT NULL) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Public Select Purchases" ON public.purchases;';
        EXECUTE 'DROP POLICY IF EXISTS "Public Insert Purchases" ON public.purchases;';
        EXECUTE 'DROP POLICY IF EXISTS "Admin Full Access Purchases" ON public.purchases;';
        EXECUTE 'CREATE POLICY "Public Select Purchases" ON public.purchases FOR SELECT USING (true);';
        EXECUTE 'CREATE POLICY "Public Insert Purchases" ON public.purchases FOR INSERT WITH CHECK (true);';
        EXECUTE 'CREATE POLICY "Admin Full Access Purchases" ON public.purchases FOR ALL USING (auth.role() = ''authenticated'');';
    END IF;

    ----------------------------------------------------------------------------
    -- 7. Coupons Table
    ----------------------------------------------------------------------------
    IF (to_regclass('public.coupons') IS NOT NULL) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Public Read Coupons" ON public.coupons;';
        EXECUTE 'DROP POLICY IF EXISTS "Admin Full Access Coupons" ON public.coupons;';
        EXECUTE 'CREATE POLICY "Public Read Coupons" ON public.coupons FOR SELECT USING (true);';
        EXECUTE 'CREATE POLICY "Admin Full Access Coupons" ON public.coupons FOR ALL USING (auth.role() = ''authenticated'');';
    END IF;

    ----------------------------------------------------------------------------
    -- 8. Article Comments Table
    ----------------------------------------------------------------------------
    IF (to_regclass('public.article_comments') IS NOT NULL) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Public Read Comments" ON public.article_comments;';
        EXECUTE 'DROP POLICY IF EXISTS "Public Insert Comments" ON public.article_comments;';
        EXECUTE 'DROP POLICY IF EXISTS "Admin Full Access Comments" ON public.article_comments;';
        EXECUTE 'CREATE POLICY "Public Read Comments" ON public.article_comments FOR SELECT USING (true);';
        EXECUTE 'CREATE POLICY "Public Insert Comments" ON public.article_comments FOR INSERT WITH CHECK (true);';
        EXECUTE 'CREATE POLICY "Admin Full Access Comments" ON public.article_comments FOR ALL USING (auth.role() = ''authenticated'');';
    END IF;

    ----------------------------------------------------------------------------
    -- 9. Comment Likes Table
    ----------------------------------------------------------------------------
    IF (to_regclass('public.comment_likes') IS NOT NULL) THEN
        EXECUTE 'DROP POLICY IF EXISTS "Public Read Comment Likes" ON public.comment_likes;';
        EXECUTE 'DROP POLICY IF EXISTS "Public Insert Comment Likes" ON public.comment_likes;';
        EXECUTE 'CREATE POLICY "Public Read Comment Likes" ON public.comment_likes FOR SELECT USING (true);';
        EXECUTE 'CREATE POLICY "Public Insert Comment Likes" ON public.comment_likes FOR INSERT WITH CHECK (true);';
    END IF;

    ----------------------------------------------------------------------------
    -- 10. Generic fallback policy for any other existing table in public schema
    ----------------------------------------------------------------------------
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        -- If no policies exist on this table yet, create a default read/write policy
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = r.tablename
        ) THEN
            EXECUTE 'CREATE POLICY "Default Access Policy" ON public.' || quote_ident(r.tablename) || ' FOR ALL USING (true) WITH CHECK (true);';
        END IF;
    END LOOP;

END $$;

-- Final Output Confirmation
SELECT 'Row-Level Security (RLS) and policies applied successfully to all existing tables!' AS status;
