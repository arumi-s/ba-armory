import { createClient } from '@supabase/supabase-js';

import type { VercelRequest, VercelResponse } from '@vercel/node';

function supabase() {
	return createClient(process.env['SUPABASE_URL'] ?? '', process.env['SERVICE_ROLE_KEY'] ?? '');
}

function base64ToBase64Url(input: string) {
	return input.replace(/[+]/g, '-').replace(/[/]/g, '_');
}

function base64UrlToBase64(input: string) {
	return input.replace(/[-]/g, '+').replace(/[_]/g, '/');
}

export default async (request: VercelRequest, response: VercelResponse) => {
	try {
		if (request.method === 'POST' && typeof request.body?.['data'] === 'string' && request.body['data'] !== '') {
			const data = request.body.data;
			const save = await supabase().from('save').insert({ data }).select('id');

			response.status(save.status);
			response.json({
				id: base64ToBase64Url(save.data?.[0]?.id ?? ''),
				error: save.error?.message,
				status: save.status,
				statusText: save.statusText,
			});
			return;
		}

		if (request.method === 'GET' && typeof request.query?.['id'] === 'string' && request.query['id'] !== '') {
			const save = await supabase().from('save').select('data').eq('id', base64UrlToBase64(request.query['id'])).limit(1).single();
			const data = save?.data?.data ?? '';

			if (data === '') {
				response.status(404);
				response.json({
					data,
					error: save.error?.message || 'Not Found',
					status: 404,
					statusText: 'Not Found',
				});
				return;
			}

			response.setHeader('Cache-Control', 'max-age=0, s-maxage=2592000, public');
			response.status(save.status);
			response.json({
				data,
				error: save.error?.message,
				status: save.status,
				statusText: save.statusText,
			});
			return;
		}
	} catch (e: unknown) {
		console.error(e);
		response.status(503);
		response.json({
			error: 'Service Unavailable',
			status: 503,
			statusText: 'Service Unavailable',
		});
		return;
	}

	response.status(400);
	response.json({
		error: 'Bad Request',
		status: 400,
		statusText: 'Bad Request',
	});
};
