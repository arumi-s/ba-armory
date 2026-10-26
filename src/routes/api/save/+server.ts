import { createClient } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';

import { SUPABASE_URL, SERVICE_ROLE_KEY } from '$app/env/private';

function supabase() {
	return createClient(SUPABASE_URL ?? '', SERVICE_ROLE_KEY ?? '');
}

function base64ToBase64Url(input: string): string {
	return input.replace(/[+]/g, '-').replace(/[/]/g, '_');
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = (await request.json()) as { data?: unknown };
		if (typeof body.data === 'string' && body.data !== '') {
			const { data: save, error } = await supabase()
				.from('save')
				.insert({ data: body.data })
				.select('id')
				.single();

			if (error) {
				return Response.json(
					{
						id: '',
						data: '',
						error: error?.message ?? 'Bad Request'
					},
					{ status: 400 }
				);
			}

			return Response.json(
				{
					id: base64ToBase64Url(save?.id ?? ''),
					data: '',
					error: null
				},
				{ status: 201 }
			);
		}
	} catch (e) {
		console.error(e);
		return Response.json({ id: '', data: '', error: 'Service Unavailable' }, { status: 503 });
	}

	return Response.json({ id: '', data: '', error: 'Bad Request' }, { status: 400 });
};
