
<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { authState, initializeAuth, loginUser } from '#lib/auth.svelte.js';

	let email = $state('');
	let password = $state('');
	let cargando = $state(false);
	let mensaje = $state('');
	let esError = $state(false);

	onMount(async () => {
		await initializeAuth();

		if (authState.user) {
			await goto(
				authState.profile?.role === 'admin' ? '/admin' : '/cuenta'
			);
		}
	});

	async function iniciarSesion(event) {
		event.preventDefault();
		cargando = true;
		mensaje = '';
		esError = false;

		const resultado = await loginUser(email.trim(), password);

		cargando = false;

		if (resultado.error) {
			esError = true;
			mensaje = 'Correo o contraseña incorrectos. Verifica tus datos.';
			return;
		}

		if (!authState.profile) {
			esError = true;
			mensaje = 'No se pudo cargar tu perfil. Contacta con soporte.';
			return;
		}

		await goto(authState.profile.role === 'admin' ? '/admin' : '/cuenta');
	}
</script>

<svelte:head>
	<title>Iniciar sesión | NEXBYTE STORE</title>
</svelte:head>

<section class="pagina">
	<div class="formulario">
		<div class="marca">N<span>.</span></div>
		<span class="etiqueta">BIENVENIDO A NEXBYTE</span>
		<h1>Inicia sesión</h1>
		<p class="descripcion">Accede a tu cuenta para continuar.</p>

		<form onsubmit={iniciarSesion}>
			<label for="email">Correo electrónico</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				autocomplete="email"
				required
				placeholder="tu correo electrónico"
			/>

			<label for="password">Contraseña</label>
			<input
				id="password"
				type="password"
				bind:value={password}
				autocomplete="current-password"
				required
				placeholder="Tu contraseña"
			/>

			<button type="submit" disabled={cargando}>
				{cargando ? 'Ingresando...' : 'Iniciar sesión →'}
			</button>

			{#if mensaje}
				<p class:error={esError} class="mensaje">{mensaje}</p>
			{/if}
		</form>

		<p class="registro">
			¿No tienes una cuenta? <a href="/registro">Regístrate aquí</a>
		</p>
	</div>
</section>

<style>
	.pagina {
		min-height: 75vh;
		display: grid;
		place-items: center;
		padding: 45px 20px;
		background: #f8f7f3;
	}

	.formulario {
		width: 100%;
		max-width: 440px;
		padding: 38px;
		background: white;
		border: 1px solid #eee;
		border-radius: 18px;
		box-shadow: 0 12px 35px #0000000a;
	}

	.marca {
		width: 46px;
		height: 46px;
		display: grid;
		place-items: center;
		background: #252522;
		color: white;
		border-radius: 12px;
		font-size: 26px;
		font-weight: bold;
		margin-bottom: 25px;
	}

	.marca span { color: #e87535; }
	.etiqueta { color: #e87535; font-size: 11px; font-weight: bold; letter-spacing: 2px; }
	h1 { font-size: 32px; margin: 12px 0; }
	.descripcion, .registro { color: #777; font-size: 14px; }

	label { display: block; margin: 20px 0 8px; font-size: 13px; font-weight: bold; }

	input {
		width: 100%;
		padding: 14px;
		border: 1px solid #ddd;
		border-radius: 9px;
		font: inherit;
	}

	input:focus { outline: 2px solid #f3c4a7; border-color: #e87535; }

	button {
		width: 100%;
		margin-top: 25px;
		padding: 15px;
		border: 0;
		border-radius: 9px;
		background: #e87535;
		color: white;
		font-weight: bold;
		cursor: pointer;
	}

	button:disabled { opacity: .6; cursor: wait; }
	.mensaje { color: #27834c; font-size: 13px; line-height: 1.5; }
	.mensaje.error { color: #c0392b; }
	.registro { text-align: center; margin-top: 25px; }
	.registro a { color: #e87535; font-weight: bold; text-decoration: none; }

	@media (max-width: 480px) {
		.formulario { padding: 27px 22px; }
	}
</style>
