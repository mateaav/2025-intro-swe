<script>
	import ProfileAvatar from '$lib/components/ProfileAvatar.svelte';

	let { children, data } = $props();

	let user = $derived(data.user);
</script>

<div class="app">
	<header>
		<div class="left-section">
			{#if user}
				<ProfileAvatar color={user.color} initials={user.initials} />
				<nav>
					<a class="home" href="/home">Kalendar</a>
					{#if user.role === 'instructor'}
						<a class="students" href="/students">Kandidati</a>
					{/if}
					<a class="profile" href="/profile">Profil</a>
				</nav>
			{/if}
		</div>

		<div class="right-section">LOGO</div>
	</header>

	<main>
		{@render children()}
	</main>

	<footer class="footer">
		<div class="footer-left-section">
			<span>Copyright © 2025 Autoskola Hajduk </span>
		</div>

		<div class="footer-right-section">
			<span>
				All Rights Reserved | <a href="/terms">"Terms and Conditions</a> |
				<a href="/privacy-policy">Privacy policy</a>
			</span>
		</div>
	</footer>
</div>

<style>
	/* vrijedi za cijelu aplikaciju, ne samo za ovaj .svelte file */
	:global {
		@import '$lib/styles/base.css';
		@import '$lib/styles/normalize.css';
		@import '$lib/styles/typography.css';
		@import '$lib/styles/utils.css';
	}

	/* od tu pisati stilove za elemente na ovom layoutu */
	.app {
		box-sizing: border-box;
		--header-height: 4.375rem;
		--footer-height: 4.375rem;
	}

	header {
		color: white;
		font-size: 1.125rem;
		height: var(--header-height);
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background-color: rgba(57, 124, 217, 1);
	}

	.left-section {
		color: white;
		margin-left: 1.5rem;
		display: flex;
		align-items: center;
	}

	nav {
		display: flex;
		align-items: center;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 0 1.2rem;
		flex-shrink: 0;
	}

	.home,
	.students {
		margin-right: 1.5rem;
	}

	.right-section {
		align-items: flex-end;
	}

	footer {
		align-items: center;
		height: var(--footer-height);
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		background-color: white;
		box-shadow: inset 0 0 3px #ccc;
	}

	.footer-right-section {
		margin-right: 1.5rem;
	}

	.footer-left-section {
		margin-left: 1.5rem;
	}

	main {
		margin-top: var(--header-height);
		min-height: calc(100svh - var(--footer-height) - var(--header-height));
		display: flex;
	}
</style>
