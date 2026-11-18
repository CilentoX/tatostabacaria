#!/bin/sh
PLAIN=$(openssl rand -hex 32)
HASH=$(printf %s "$PLAIN" | sha256sum | cut -d' ' -f1)
echo "INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token, abilities, created_at, updated_at) VALUES ('App\\Models\\User', 0, 'codex-api', '$HASH', '[\"*\"]', NOW(), NOW());" > /tmp/ins.sql
docker cp /tmp/ins.sql coolify-db:/tmp/ins.sql
docker exec coolify-db psql -U coolify -d coolify -t -f /tmp/ins.sql
echo "TOKEN:$PLAIN"
rm /tmp/ins.sql
