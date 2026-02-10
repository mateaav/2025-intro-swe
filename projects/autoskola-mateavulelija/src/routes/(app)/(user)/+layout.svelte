<script>
	import { getEventEndPIT, isSameDayEvent } from '$lib/domain/event.js';
	import { getUserSessionColor } from '$lib/utils.js/common.js';
	import Calendar from '@event-calendar/core';
	import DayGrid from '@event-calendar/day-grid';
	import List from '@event-calendar/list';

	let { children, data } = $props();

	let user = $derived(data.user);
	let events = $derived(data.events);
	let students = $derived(data.students);

	let demoOptionsCalendar = $derived({
		view: 'dayGridMonth',
		headerToolbar: {
			start: 'title',
			center: '',
			end: ''
		},
		events: Object.values(
			events
				.map((event) => ({
					id: event.id,
					start: new Date(event.pit).toISOString(),
					end: getEventEndPIT(event.pit, event.duration),
					resourceId: event.studentEmail,
					color: getUserSessionColor(event.studentEmail),
					title: '',
					status: event.status
				}))
				.reduce((acc, candidate) => {
					if (!acc[candidate.resourceId]) {
						acc[candidate.resourceId] = [candidate];
					} else if (
						!acc[candidate.resourceId].some((event) =>
							isSameDayEvent(event, candidate)
						)
					) {
						acc[candidate.resourceId].push(candidate);
					}

					return acc;
				}, {})
		).flat(),
		locale: 'hr',
		dayCellFormat: { day: '2-digit' },
		eventTimeFormat: () => ''
	});

	let demoOptionsTimeline = $derived({
		view: 'listWeek',
		headerToolbar: {
			start: '',
			center: '',
			end: ''
		},
		events: events
			.map((event) => {
				if (user.role === 'instructor') {
					const { name } = students.find(
						({ email }) => email === event.studentEmail
					);

					return {
						id: event.id,
						start: new Date(event.pit).toISOString(),
						end: getEventEndPIT(event.pit, event.duration),
						resourceId: event.studentEmail,
						color: getUserSessionColor(event.studentEmail),
						title: `Vožnja - ${name}`,
						status: event.status
					};
				} else if (user.role === 'student') {
					return {
						id: event.id,
						start: new Date(event.pit).toISOString(),
						end: getEventEndPIT(event.pit, event.duration),
						resourceId: event.studentEmail,
						color: getUserSessionColor(event.studentEmail),
						title: `Vožnja`,
						status: event.status
					};
				}
			})
			.filter(({ status }) => !status),
		locale: 'hr',
		selectable: true,
		hiddenDays: Array.from(Array(7).keys()).filter(
			(day) => day !== new Date().getDay()
		)
	});
</script>

<aside>
	<div class="calendar--container">
		<Calendar plugins={[DayGrid]} options={demoOptionsCalendar} />
	</div>
	<div class="timeline--container">
		<Calendar plugins={[List]} options={demoOptionsTimeline} />
	</div>
</aside>
{@render children()}

<style>
	.calendar--container {
		height: 100%;
		width: 100%;

		:global {
			.ec-event {
				font-size: 0.4em;
			}
		}
	}

	.timeline--container {
		height: 100%;
		width: 100%;
	}

	aside {
		height: 100%;
		width: 25svw;
	}
</style>
