import { page } from '$app/state';
import { error } from '@sveltejs/kit';
import { getUser } from '$lib/domain/user';
import { getEvents } from '$lib/domain/event';
import { getStudentsForInstructor } from '$lib/domain/instructor';

export const ssr = false;

/** @type {import('../$types').LayoutLoad} */
export async function load({ route, parent, depends }) {
	depends('layout:user');

	const { user } = await parent();
	let data;

	data = {
		...(user.role === 'instructor' && {
			students: await getStudentsForInstructor()
		})
	};

	// events must be initialized after students
	data = {
		...data,
		events: await getEvents(user.role)
	};

	return data;
}
