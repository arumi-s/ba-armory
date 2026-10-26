import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * Server-side environment variables for the save API.
 * Values are read from the process environment at request time
 * (see $app/env/private in src/routes/api/save).
 */
export const variables = defineEnvVars({
	SUPABASE_URL: {
		schema: (value) => value
	},
	SERVICE_ROLE_KEY: {
		schema: (value) => value
	}
});
