<script>
	import ProfileAvatar from '$lib/components/ProfileAvatar.svelte';

	let { data } = $props();
	let students = $derived(data.students);

	let selected = $state(0);
	let selectedStudent = $derived(students[selected]);
</script>

<div class="main-container">
	<header class="header">
		<div class="left-section">Kandidati</div>
		<div class="right-section"></div>
	</header>

	<div>
		<div class="content">
			<div class="students-list">
				{#each students as { name, initials, color }, id}
					<input
						class="visually-hidden"
						type="radio"
						name={id}
						{id}
						value={id}
						bind:group={selected}
					/>
					<label for={id} class="student">
						<ProfileAvatar {color} {initials} />
						<span class="name">{name}</span>
					</label>
				{/each}
			</div>

			<div class="student-info">
				<div class="student">
					<ProfileAvatar
						color={selectedStudent.color}
						initials={selectedStudent.initials}
					/>
					<span class="name">{selectedStudent.name}</span>
				</div>

				<div class="osobni-podaci">
					<!-- Prva pomoć mora biti položena da bi kandidat uopće došao kod instruktora -->
					<div>Propisi su položeni.</div>
					<div>
						{`Prva pomoć ${selectedStudent.firstAid ? '' : 'ni'}je položena`}
					</div>
					<div>{selectedStudent.hoursDriven}h je odvezeno</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.header {
		height: 89px;

		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30px 10%;

		color: black;
		font-size: 32px;
		background-color: white;

		box-shadow:
			0 4px 8px 0 rgba(0, 0, 0, 0.2),
			0 6px 20px 0 rgba(0, 0, 0, 0.19);
	}

	.main-container {
		width: 100%;
	}

	.left-section {
		font-size: 34px;
	}

	.students-list {
		width: 500px;
		height: max-content;
		box-shadow:
			0 4px 8px 0 rgba(0, 0, 0, 0.2),
			0 6px 20px 0 rgba(0, 0, 0, 0.19);
		margin: 10px;
	}

	.students-list input:checked + .student {
		background-color: lightblue;
	}

	.student {
		display: flex;
		align-items: center;
		padding: 10px;
	}

	.name {
		margin-left: 10px;
	}

	.student-info {
		width: 500px;
		height: max-content;
		box-shadow:
			0 4px 8px 0 rgba(0, 0, 0, 0.2),
			0 6px 20px 0 rgba(0, 0, 0, 0.19);
		margin: 10px;
		padding: 10px;
	}

	.content {
		display: flex;
		justify-content: space-between;
	}

	.osobni-podaci {
		display: flex;
		align-items: start;
		flex-direction: column;
		padding: 10px;
		gap: 10px;
	}
</style>
