<script>
	import { goto } from '$app/navigation';
	import { createSession } from '$lib/domain/session';

	let email, password;

	async function handleSubmit(event) {
		event.preventDefault();
		await createSession(email, password);
		goto('/home');
	}
</script>

<h1>Login</h1>
<form onsubmit={handleSubmit}>
	<div>
		<label for="">email</label>
		<input
			type="email"
			placeholder="Enter your email"
			name="email"
			bind:value={email}
			required
		/>
	</div>
	<div>
		<label for="">password</label>
		<input
			type="password"
			placeholder="Enter your password"
			name="password"
			bind:value={password}
			required
			minlength="8"
		/>
	</div>
	<button type="submit"> submit </button>
</form>
