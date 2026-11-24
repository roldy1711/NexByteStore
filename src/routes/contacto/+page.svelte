
<script>
	import { supabase } from '#lib/supabase';

	let nombre = $state('');
	let correo = $state('');
	let asunto = $state('');
	let mensaje = $state('');
	let enviando = $state(false);
	let resultado = $state('');
	let exito = $state(false);

	async function enviarFormulario(event) {
		event.preventDefault();

		resultado = '';
		enviando = true;

		try {
			const { error } = await supabase
				.from('contact_messages')
				.insert({
					name: nombre.trim(),
					email: correo.trim(),
					subject: asunto.trim(),
					message: mensaje.trim()
				});

			if (error) throw error;

			exito = true;
			resultado = '¡Mensaje enviado correctamente!';

			nombre = '';
			correo = '';
			asunto = '';
			mensaje = '';
		} catch (error) {
			console.error(error);
			exito = false;
			resultado = 'No se pudo enviar el mensaje. Inténtalo nuevamente.';
		} finally {
			enviando = false;
		}
	}
</script>

<svelte:head>
	<title>Contacto | NEXBYTE STORE</title>
</svelte:head>

<section class="contact-page">
	<div class="intro">
		<span>ESTAMOS PARA AYUDARTE</span>
		<h1>Hablemos de <strong>tecnología.</strong></h1>
		<p>
			¿Tienes alguna pregunta, necesitas información o quieres
			ayuda para elegir un equipo? Escríbenos.
		</p>
	</div>

	<div class="contact-grid">
		<div class="info">
			<h2>Contáctanos</h2>
			<p>Estamos disponibles para atender tus consultas.</p>

			<div class="info-item">
				<span>📍</span>
				<div>
					<strong>Ubicación</strong>
					<p>Baní, República Dominicana</p>
				</div>
			</div>

			<div class="info-item">
				<span>✉️</span>
				<div>
					<strong>Correo electrónico</strong>
					<p>Escríbenos mediante el formulario.</p>
				</div>
			</div>

			<div class="info-item">
				<span>💻</span>
				<div>
					<strong>Atención tecnológica</strong>
					<p>Productos, equipos y asesoría.</p>
				</div>
			</div>
		</div>

		<form onsubmit={enviarFormulario}>
			<h2>Envíanos un mensaje</h2>

			<label for="nombre">Nombre completo</label>
			<input id="nombre" bind:value={nombre} required minlength="2" maxlength="100" placeholder="Tu nombre" />

			<label for="correo">Correo electrónico</label>
			<input id="correo" type="email" bind:value={correo} required maxlength="255" placeholder="correo@ejemplo.com" />

			<label for="asunto">Asunto</label>
			<input id="asunto" bind:value={asunto} required minlength="2" maxlength="150" placeholder="¿En qué podemos ayudarte?" />

			<label for="mensaje">Mensaje</label>
			<textarea id="mensaje" bind:value={mensaje} required minlength="10" maxlength="2000" rows="5" placeholder="Escribe tu mensaje..."></textarea>

			<button type="submit" disabled={enviando}>
				{enviando ? 'Enviando...' : 'Enviar mensaje ↗'}
			</button>

			{#if resultado}
				<p class:success={exito} class:error={!exito} aria-live="polite">
					{resultado}
				</p>
			{/if}
		</form>
	</div>
</section>

<style>
	.contact-page {
		max-width: 1150px;
		margin: auto;
		padding: 65px 25px 85px;
	}

	.intro {
		max-width: 650px;
		margin-bottom: 45px;
	}

	.intro > span {
		color: #ff7138;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 2px;
	}

	h1 {
		font-size: clamp(35px, 5vw, 55px);
		letter-spacing: -2px;
		margin: 15px 0;
	}

	h1 strong {
		color: #ff7138;
	}

	.intro > p, .info > p {
		color: #77746d;
		line-height: 1.7;
	}

	.contact-grid {
		display: grid;
		grid-template-columns: .8fr 1.2fr;
		gap: 35px;
	}

	.info, form {
		padding: 30px;
		border-radius: 12px;
	}

	.info {
		background: #252522;
		color: white;
	}

	.info > p {
		color: #c4c1b9;
	}

	.info-item {
		display: flex;
		gap: 15px;
		margin-top: 35px;
	}

	.info-item > span {
		font-size: 23px;
	}

	.info-item strong {
		font-size: 14px;
	}

	.info-item p {
		font-size: 12px;
		color: #c4c1b9;
		margin-bottom: 0;
	}

	form {
		background: white;
		border: 1px solid #ece9e2;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	form h2 {
		margin-top: 0;
		margin-bottom: 10px;
	}

	label {
		font-size: 12px;
		font-weight: 700;
	}

	input, textarea {
		width: 100%;
		padding: 13px;
		border: 1px solid #e5e2db;
		border-radius: 7px;
		background: #faf9f6;
		font: inherit;
		font-size: 13px;
		outline: none;
	}

	input:focus, textarea:focus {
		border-color: #ff7138;
	}

	textarea {
		resize: vertical;
	}

	button {
		margin-top: 8px;
		padding: 15px;
		background: #ff7138;
		color: white;
		border: 0;
		border-radius: 7px;
		font-weight: 700;
		cursor: pointer;
	}

	button:disabled {
		opacity: .6;
		cursor: not-allowed;
	}

	.success {
		color: #218447;
	}

	.error {
		color: #c0392b;
	}

	@media (max-width: 750px) {
		.contact-grid {
			grid-template-columns: 1fr;
		}
	}
</style>