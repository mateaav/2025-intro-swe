<script>
	import { goto } from '$app/navigation';
	import { clearAuthToken } from '$lib/domain/session.js';

	let { data } = $props();
	let user = $derived(data.user);

	function handleLogOut() {
		clearAuthToken();
		goto('/login');
	}
</script>

<div class="main-container">
	<header class="header">
		<div class="left-section">Profil</div>
	</header>

	<div>
		<div class="info">
			<div class="osobni-podaci">
				<div>
					Ime i prezime: {user.role === 'student'
						? user.polaznik_name
						: user.instruktor_name}
				</div>
				{#if user.role === 'instructor'}
					<div>OIB: {user.oib}</div>
				{/if}
				{#if user.role === 'student'}
					<div>Odvezeni sati: {user.odvozeni_sati}</div>
				{/if}
			</div>
		</div>
		<button class="logout" onclick={handleLogOut}>Log out</button>
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

	.info {
		width: 500px;
		height: max-content;
		box-shadow:
			0 4px 8px 0 rgba(0, 0, 0, 0.2),
			0 6px 20px 0 rgba(0, 0, 0, 0.19);
		margin: 10px;
	}

	.osobni-podaci {
		display: flex;
		align-items: start;
		flex-direction: column;
		padding: 10px;
		gap: 10px;
	}

	.logout {
		padding: 10px;
		background-color: rgba(0, 50, 97, 1);
		color: white;
		border-radius: 4px;
		margin: 15px;
		margin-top: 0;
	}
</style>
