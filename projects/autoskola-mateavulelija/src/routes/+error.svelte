<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
</script>

{#if page.status === 401}
	<h1>Unauthorized</h1>
	<div>{page.error?.message}</div>
	<button
		onclick={() => {
			goto('/login');
		}}
	>
		Login
	</button>
{:else}
	<h1>Error</h1>
	<div>{page.error?.message}</div>
{/if}
