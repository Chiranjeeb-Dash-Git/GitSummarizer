CREATE EXTENSION IF NOT EXISTS citext;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE repositories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner           TEXT NOT NULL,
  name            TEXT NOT NULL,
  full_name       TEXT NOT NULL UNIQUE,            -- lower(owner/name), the lookup key
  description     TEXT,
  html_url        TEXT NOT NULL,
  avatar_url      TEXT,
  stars           INTEGER NOT NULL DEFAULT 0,
  forks           INTEGER NOT NULL DEFAULT 0,
  language        TEXT,
  topics          TEXT[] NOT NULL DEFAULT '{}',
  default_branch  TEXT NOT NULL DEFAULT 'main',
  license         TEXT,
  pushed_at       TIMESTAMPTZ,
  last_fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE TYPE summary_kind AS ENUM ('overview', 'release_notes', 'commit');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE audience_kind AS ENUM ('learner', 'product', 'maintainer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE summaries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id  UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  kind           summary_kind NOT NULL,
  audience       audience_kind NOT NULL,
  ref            TEXT NOT NULL,        -- branch | full commit sha | base...head | last:N@branch
  head_sha       TEXT NOT NULL,        -- newest commit sha seen when generated
  title          TEXT NOT NULL,
  content_md     TEXT NOT NULL,
  provider       TEXT NOT NULL,
  model          TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  tokens_in      INTEGER,
  tokens_out     INTEGER,
  latency_ms     INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT summaries_cache_key UNIQUE (repository_id, kind, audience, ref, prompt_version, head_sha)
);
CREATE INDEX IF NOT EXISTS idx_summaries_lookup ON summaries (repository_id, kind, audience, ref, prompt_version, created_at DESC);

CREATE TABLE search_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary_id  UUID NOT NULL REFERENCES summaries(id) ON DELETE CASCADE,
  query_input TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_history_user_created ON search_history (user_id, created_at DESC, id DESC);

CREATE TABLE saved_summaries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary_id UUID NOT NULL REFERENCES summaries(id) ON DELETE CASCADE,
  note       TEXT NOT NULL DEFAULT '',
  tags       TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, summary_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_user_created ON saved_summaries (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_tags ON saved_summaries USING GIN (tags);
CREATE TRIGGER saved_updated_at BEFORE UPDATE ON saved_summaries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

