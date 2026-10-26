import { createClient } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';

import { SUPABASE_URL, SERVICE_ROLE_KEY } from '$app/env/private';

function supabase() {
	return createClient(SUPABASE_URL ?? '', SERVICE_ROLE_KEY ?? '');
}

function base64UrlToBase64(input: string): string {
	return input.replace(/[-]/g, '+').replace(/[_]/g, '/');
}

export const GET: RequestHandler = async ({ params }) => {
	try {
		const id = base64UrlToBase64(params.id);
		const save = await supabase().from('save').select('data').eq('id', id).limit(1).single();
		const data = (save.data?.data as string | undefined) ?? '';

		if (save.error || data === '') {
			return Response.json(
				{
					id,
					data: '',
					error: save.error?.message || 'Not Found'
				},
				{ status: data === '' ? 404 : 400 }
			);
		}

		return Response.json(
			{
				id,
				data,
				error: null
			},
			{
				status: 200,
				headers: { 'Cache-Control': 'max-age=0, s-maxage=2592000, public' }
			}
		);
	} catch (e) {
		console.error(e);
		return Response.json({ id: '', data: '', error: 'Service Unavailable' }, { status: 503 });
	}
};
