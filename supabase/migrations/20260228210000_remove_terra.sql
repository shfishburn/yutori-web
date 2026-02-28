-- Remove Terra webhook infrastructure (Terra SDK has been removed from the app)

DROP FUNCTION IF EXISTS public.purge_terra_webhook_log(timestamptz);
DROP TABLE IF EXISTS public.terra_webhook_log;

-- Update health_samples default source (Terra is no longer a data source)
ALTER TABLE public.health_samples ALTER COLUMN source SET DEFAULT 'app';
