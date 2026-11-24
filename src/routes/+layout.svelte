
<script>
	import { onMount } from 'svelte';
	import Header from '../lib/Header.svelte';
	import { initializeAuth } from '#lib/auth.svelte.js';

	let { children } = $props();

	onMount(() => {
		initializeAuth();
	});
</script>

<svelte:head>
	<title>NEXBYTE STORE | Tecnología a tu alcance</title>
	<meta
		name="description"
		content="Descubre laptops, computadoras, componentes y accesorios tecnológicos en NEXBYTE STORE."
	/>
</svelte:head>

<div class="app">
	<Header />

	<main>
		{@render children()}
	</main>

	<footer>
		<p>© 2026 NEXBYTE STORE. Todos los derechos reservados.</p>
		<p>Baní, República Dominicana</p>
	</footer>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(html) {
		scroll-behavior: smooth;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: Arial, Helvetica, sans-serif;
		background: #f8f7f3;
		color: #252522;
	}

	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	main {
		flex: 1;
		width: 100%;
	}

	footer {
		padding: 25px 20px;
		text-align: center;
		background: #252522;
		color: #d5d2ca;
		font-size: 12px;
	}

	footer p {
		margin: 5px;
	}
</style>