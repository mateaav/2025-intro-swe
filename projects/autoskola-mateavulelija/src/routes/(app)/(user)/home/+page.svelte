<script>
	import Calendar from '@event-calendar/core';
	import TimeGrid from '@event-calendar/time-grid';
	import Modal from '$lib/components/Modal.svelte';
	import {
		convertEventForTimegrid,
		createEvent,
		finishEvent,
		deleteEvent
	} from '$lib/domain/event.js';
	import { replaceUTCWithTimezone } from '$lib/utils.js/common.js';
	import { invalidate } from '$app/navigation';

	let { data } = $props();

	let user = $derived(data.user);
	let events = $derived(data.events);
	let students = $derived(data.students);

	let eventEditId = $state(undefined);
	let editableEvent = $derived(events.find((event) => event.id == eventEditId));

	let modalEventAdd;
	let modalEventEdit;
	let calendar;

	let demoOptions = $derived({
		view: 'timeGridWeek',
		customButtons: {
			addEvent: {
				text: 'Schedule an event',
				click: () => {
					modalEventAdd.showModal();
				}
			}
		},
		headerToolbar: {
			start: 'prev,next today',
			center: 'title',
			end: `${user.role === 'instructor' ? 'addEvent ' : ''}timeGridWeek,timeGridDay`
		},
		events: events.map((event) => convertEventForTimegrid(event)),
		nowIndicator: true,
		selectable: true,
		slotMaxTime: '23:00:00',
		slotMinTime: '07:00:00',
		eventTimeFormat: (date) => '',
		dayHeaderFormat: { weekday: 'long' },
		slotLabelFormat: { hour: 'numeric', minute: '2-digit' },
		locale: 'hr',
		firstDay: 1,
		allDaySlot: false,
		eventClick: (info) => {
			modalEventEdit.showModal();
			eventEditId = info.event.id;
		}
	});

	const formDataInitial = {
		pit: undefined,
		location: '',
		duration: '',
		studentEmail: ''
	};
	let formData = $state(formDataInitial);

	async function handleSubmit(e) {
		e.preventDefault();

		try {
			const event = {
				instructorEmail: user.instruktor_email,
				studentEmail: formData.studentEmail,
				pit: new Date(
					replaceUTCWithTimezone(new Date(formData.pit).toISOString())
				).toISOString(),
				duration: formData.duration,
				location: formData.location
			};

			const response = await createEvent(event);
			if (response === undefined) {
				throw new Error();
			}

			await invalidate('layout:user');
			modalEventAdd.closeModal();
			formData = formDataInitial;
		} catch (error) {
			alert('Failed to create an event!');
		}
	}

	async function handleDeleteEvent(e) {
		e.preventDefault();

		if ((await deleteEvent(eventEditId)) === undefined) {
			throw new Error();
		}

		await invalidate('layout:user');
		modalEventEdit.closeModal();
	}

	async function handleFinishEvent(e) {
		e.preventDefault();

		if (
			(await finishEvent(eventEditId, editableEvent.studentEmail)) === undefined
		) {
			throw new Error();
		}

		await invalidate('layout:user');
		modalEventEdit.closeModal();
	}
</script>

<div class="calendar--container">
	<Calendar bind:this={calendar} plugins={[TimeGrid]} options={demoOptions} />
	<Modal
		bind:this={modalEventAdd}
		variant="test-klasa"
		--width="100%"
		--max-width="550px"
	>
		<button
			class="modal_close"
			onclick={() => {
				modalEventAdd.closeModal();
				formData = formDataInitial;
			}}>X</button
		>
		<div>
			<p class="modal_naslov">Dodaj novi event</p>
			<form onsubmit={handleSubmit}>
				<fieldset>
					<input
						type="datetime-local"
						name="datetime-local"
						id="datetime-local"
						class="modal_datetime"
						bind:value={formData.pit}
						required
					/>

					<select
						name="duration"
						id="duration"
						class="modal_duration"
						bind:value={formData.duration}
						required
					>
						<option value="" disabled selected>Odredi trajanje</option>
						<option value="01:00">1:00</option>
						<option value="02:00">2:00</option>
						<option value="03:00">3:00</option>
					</select>

					<input
						type="text"
						name="Lokacija"
						placeholder="Lokacija"
						class="modal_location"
						bind:value={formData.location}
						required
					/>

					<select
						name="studenti"
						id="Studenti"
						class="modal_student"
						bind:value={formData.studentEmail}
						required
					>
						<option value="" disabled selected>Dodaj kandidata</option>
						{#each students as { name, email }}
							<option value={email}>{name}</option>
						{/each}
					</select>
				</fieldset>
				<button type="submit" class="dodaj-btn">Dodaj</button>
			</form>
		</div>
	</Modal>
	<Modal
		bind:this={modalEventEdit}
		variant="test-klasa"
		--width="100%"
		--max-width="550px"
		onClose={() => {
			eventEditId = undefined;
		}}
	>
		<button
			class="modal_close"
			onclick={() => {
				modalEventEdit.closeModal();
			}}
		>
			X
		</button>
		<div class="modal-info">
			{#if user.role === 'instructor'}
				<span class="student">
					Student email: {editableEvent?.studentEmail}
				</span>
			{:else if user.role === 'student'}
				<span class="student">
					Instructor email: {editableEvent?.instructorEmail}
				</span>
			{/if}
			<span class="pit">
				Vrijeme termina: {editableEvent?.pit}
			</span>
			<span class="duration">
				Trajanje: {editableEvent?.duration}
			</span>
			<span class="location">
				Lokacija: {editableEvent?.location}
			</span>
		</div>
		{#if user.role === 'instructor'}
			<div>
				<p class="modal_naslov">Uredi termin</p>
				<div class="modal_edit">
					<button class="delete-btn" onclick={handleDeleteEvent}>
						Izbriši termin
					</button>
					<button class="edit-btn" onclick={handleFinishEvent}>
						Završi termin
					</button>
				</div>
			</div>
		{/if}
	</Modal>
</div>

<style>
	.calendar--container {
		height: 100%;
		width: 100%;
		margin: 15px;

		:global {
			.ec-event-title {
				color: black;
			}

			.ec-active {
				background-color: rgba(0, 50, 97, 1);
				color: white;
			}

			.ec-button {
				border-color: black;
				margin-top: 15px;
			}

			.ec-button:not(:disabled):hover {
				background-color: rgba(0, 50, 97, 1);
			}

			.ec-icon {
				color: black;
			}

			.ec-today:not(:disabled) {
				color: rgba(0, 50, 97, 1);
			}

			.ec-time-grid .ec-body:not(.ec-compact) .ec-line:nth-child(even):after {
				border-bottom-style: none;
			}

			.ec-sidebar {
				padding: 0;
			}

			.ec-today {
				--ec-today-bg-color: rgba(205, 233, 255, 1);
			}

			:modal {
				background-color: rgba(233, 242, 255, 1);
				height: max-content;
				border-radius: 7px;
				box-shadow:
					0 4px 8px 0 rgba(0, 0, 0, 0.2),
					0 6px 20px 0 rgba(0, 0, 0, 0.19);
				padding: 10px;
			}
		}
	}

	.modal_naslov {
		color: rgba(0, 50, 97, 1);
		font-size: 18px;
		font-weight: bolder;
		padding-top: 20px;
		padding-bottom: 0px;
		margin-left: 30px;
	}

	form {
		background-color: none;
		border: 12px;
		margin-left: 15px;
		margin-right: 15px;
		margin-top: 14px;
		margin-bottom: 14px;
	}

	fieldset {
		padding: 15px;
		font-weight: bold;
		border: rgba(197, 197, 197, 0.5);
		border-radius: 12px;
		display: flex;
		flex-direction: column;
	}

	.modal_student,
	.modal_duration {
		padding: 10px;
		border-radius: 8px;
		background-color: white;
		border-color: none;
		border-top: 5px;
		border-bottom: 5px;
		border-left: 5px;
		border-right: 5px;
		margin-top: 5px;
	}

	.modal_location,
	.modal_datetime {
		padding: 10px;
		border-radius: 8px;
		background-color: white;
		border-color: rgba(197, 197, 197, 0.8);
		margin-top: 5px;
		line-height: 1;
		border-top: 2px;
		border-bottom: 2px;
		border-left: 2px;
		border-right: 2px;
	}

	.dodaj-btn {
		padding: 10px;
		margin-left: 440px;
		background-color: rgba(0, 50, 97, 1);
		color: white;
		border-radius: 4px;
		margin-bottom: 15px;
	}

	.modal_edit {
		display: flex;
		flex-direction: column;
	}

	.edit-btn,
	.delete-btn {
		padding: 10px;
		color: white;
		border-radius: 4px;
		margin-top: 15px;
	}

	.edit-btn {
		background-color: green;
	}

	.delete-btn {
		background-color: crimson;
	}

	.modal-info {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 10px;
	}
</style>
