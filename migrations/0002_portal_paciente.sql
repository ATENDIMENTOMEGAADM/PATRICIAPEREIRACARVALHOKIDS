-- Portal do paciente: login próprio do site, vinculado ao cadastro do paciente no Consul+.
-- Aditiva: não toca nas tabelas da equipe (admin_*) nem no sistema de receitas.
CREATE TABLE patient_users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,                 -- nulo até o paciente aceitar o convite
  name TEXT NOT NULL,
  remote_patient_id TEXT NOT NULL,    -- id do paciente no Consul+
  integration_id TEXT NOT NULL REFERENCES integrations(id),
  status TEXT NOT NULL DEFAULT 'invited',   -- invited | active
  invite_token_hash TEXT,
  invite_expires_at INTEGER,
  created_at INTEGER NOT NULL
);
-- Um acesso por paciente (por conexão Consul+).
CREATE UNIQUE INDEX patient_users_patient ON patient_users (integration_id, remote_patient_id);
CREATE TABLE patient_sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES patient_users(id),
  created_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX patient_sessions_user ON patient_sessions (user_id);
