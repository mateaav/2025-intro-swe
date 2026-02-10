import { page } from '$app/state';
import { error } from '@sveltejs/kit';
import { getUser } from '$lib/domain/user';
import { goto } from '$app/navigation';

export const ssr = false;

/** @type {import('../$types').LayoutLoad} */
export async function load({ route }) {
	let data;

	if (route.id === '/(app)' || route.id.includes('/(app)/(user)')) {
		try {
			data = {
				user: await getUser()
			};
		} catch (_) {
			goto('/login');
		}

		if (data.user && route.id === '/(app)') {
			goto('/home');
		}

		return data;
	}
}
