
<script>
	import { goto } from '$app/navigation';
	import { registerUser } from '#lib/auth.svelte.js';

	let nombre = $state('');
	let email = $state('');
	let password = $state('');
	let confirmarPassword = $state('');
	let cargando = $state(false);
	let mensaje = $state('');
	let esError = $state(false);

	async function registrarse(event) {
		event.preventDefault();
		mensaje = '';
		esError = false;

		if (password.length < 8) {
			esError = true;
			mensaje = 'La contraseña debe tener al menos 8 caracteres.';
			return;
		}

		if (password !== confirmarPassword) {
			esError = true;
			mensaje = 'Las contraseñas no coinciden.';
			return;
		}

		cargando = true;

		const resultado = await registerUser(
			nombre.trim(),
			email.trim(),
			password
		);

		cargando = false;

		if (resultado.error) {
			esError = true;
			mensaje = resultado.error.message;
			return;
		}

		if (resultado.confirmationRequired) {
			mensaje = 'Cuenta creada. Revisa tu correo y confirma tu dirección antes de iniciar sesión.';
			return;
		}

		await goto('/cuenta');
	}
</script>

<svelte:head>
	<title>Crear cuenta | NEXBYTE STORE</title>
</svelte:head>

<section class="pagina">
	<div class="formulario">
		<span class="etiqueta">ÚNETE A NEXBYTE</span>
		<h1>Crea tu cuenta</h1>
		<p>Regístrate para disfrutar de una experiencia personalizada.</p>

		<form onsubmit={registrarse}>
			<label for="nombre">Nombre completo</label>
			<input id="nombre" bind:value={nombre} required minlength="2"
				autocomplete="name" placeholder="Tu nombre" />

			<label for="email">Correo electrónico</label>
			<input id="email" type="email" bind:value={email} required
				autocomplete="email" placeholder="tu correo electrónico" />

			<label for="password">Contraseña</label>
			<input id="password" type="password" bind:value={password}
				required minlength="8" autocomplete="new-password"
				placeholder="Mínimo 8 caracteres" />

			<label for="confirmar">Confirmar contraseña</label>
			<input id="confirmar" type="password" bind:value={confirmarPassword}
				required autocomplete="new-password" placeholder="Repite tu contraseña" />

			<button type="submit" disabled={cargando}>
				{cargando ? 'Creando cuenta...' : 'Crear cuenta →'}
			</button>

			{#if mensaje}
				<p class:error={esError} class="mensaje">{mensaje}</p>
			{/if}
		</form>

		<div class="pie">
			¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
		</div>
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
		max-width: 470px;
		padding: 38px;
		background: white;
		border: 1px solid #eee;
		border-radius: 18px;
		box-shadow: 0 12px 35px #0000000a;
	}

	.etiqueta { color: #e87535; font-size: 11px; font-weight: bold; letter-spacing: 2px; }
	h1 { font-size: 32px; margin: 12px 0; }
	.formulario > p { color: #777; font-size: 14px; line-height: 1.6; }
	label { display: block; margin: 18px 0 8px; font-size: 13px; font-weight: bold; }

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
	.mensaje { color: #27834c; font-size: 13px; line-height: 1.6; }
	.mensaje.error { color: #c0392b; }
	.pie { text-align: center; margin-top: 25px; color: #777; font-size: 14px; }
	.pie a { color: #e87535; font-weight: bold; text-decoration: none; }

	@media (max-width: 480px) {
		.formulario { padding: 27px 22px; }
	}
</style>
