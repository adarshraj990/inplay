-- docker/postgres/init.sql — PostgreSQL initialization script
-- Extensions for WePlay
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fast fuzzy username search
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- for normalized text search

-- WePlay DB is fully managed by Prisma migrations
-- This file only installs required extensions
