-- Trilha de auditoria (LGPD): registra acessos a dados de paciente e ações da equipe sobre acessos.
-- ADITIVA: cria uma tabela nova; não altera admin_*, patient_*, integrations nem as migrações 0001/0002.
-- Sem FK para patient_users de propósito: o log deve SOBREVIVER à revogação (DELETE) do acesso do paciente.
CREATE TABLE access_log (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER NOT NULL,          -- epoch (s)
  actor_type TEXT NOT NULL,             -- patient | staff | system
  actor_id TEXT,                        -- admin_users.id ou patient_users.id, quando houver
  patient_user_id TEXT,                 -- patient_users.id (dado acessado)
  remote_patient_id TEXT,               -- id do paciente no Consul+
  integration_id TEXT,                  -- conexão Consul+ usada
  action TEXT NOT NULL,                 -- ex.: patient.receita.read, staff.access.create
  resource_id TEXT,                     -- ex.: id da receita lida
  ip TEXT,
  user_agent TEXT
);
CREATE INDEX access_log_patient ON access_log (patient_user_id, created_at);
CREATE INDEX access_log_created ON access_log (created_at);
