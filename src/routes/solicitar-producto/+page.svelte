
<script>
	import { supabase } from '#lib/supabase';

	let nombre = $state('');
	let correo = $state('');
	let telefono = $state('');
	let producto = $state('');
	let detalles = $state('');

	let cargando = $state(false);
	let mensaje = $state('');
	let error = $state(false);

	async function enviarSolicitud(event) {
		event.preventDefault();

		cargando = true;
		mensaje = '';
		error = false;

		const { error: supabaseError } = await supabase
			.from('product_requests')
			.insert([{
				name: nombre,
				email: correo,
				phone: telefono || null,
				product_name: producto,
				details: detalles || null
			}]);

		cargando = false;

		if (supabaseError) {
			error = true;
			mensaje = 'No se pudo enviar la solicitud. Inténtalo nuevamente.';
			console.error(supabaseError);
			return;
		}

		mensaje = '¡Solicitud enviada correctamente! Nos pondremos en contacto contigo.';
		nombre = '';
		correo = '';
		telefono = '';
		producto = '';
		detalles = '';
	}
</script>

<svelte:head>
	<title>Solicitar producto | NEXBYTE STORE</title>
</svelte:head>

<section class="pagina">
	<div class="contenedor">
		<div class="encabezado">
			<span class="etiqueta">ATENCIÓN AL CLIENTE</span>
			<h1>Solicita tu <span>producto.</span></h1>
			<p>
				¿Buscas un equipo o componente que no aparece en nuestro catálogo?
				Envíanos los detalles y te contactaremos.
			</p>
		</div>

		<form onsubmit={enviarSolicitud}>
			<label for="nombre">Nombre completo</label>
			<input id="nombre" bind:value={nombre} required minlength="2"
				placeholder="Tu nombre" />

			<label for="correo">Correo electrónico</label>
			<input id="correo" type="email" bind:value={correo} required
				placeholder="ejemplo@correo.com" />

			<label for="telefono">Teléfono</label>
			<input id="telefono" type="tel" bind:value={telefono}
				placeholder="Tu número de contacto" />

			<label for="producto">Producto que buscas</label>
			<input id="producto" bind:value={producto} required minlength="2"
				placeholder="Ej. Laptop HP, tarjeta gráfica..." />

			<label for="detalles">Detalles adicionales</label>
			<textarea id="detalles" bind:value={detalles}
				placeholder="Marca, modelo o características que necesitas..."
				rows="5"></textarea>

			<button type="submit" disabled={cargando}>
				{cargando ? 'Enviando...' : 'Enviar solicitud →'}
			</button>

			{#if mensaje}
				<p class:fallo={error} class="respuesta">{mensaje}</p>
			{/if}
		</form>
	</div>
</section>

<style>
	.pagina {
		padding: 75px 20px;
		background: #f8f7f3;
		min-height: 80vh;
	}

	.contenedor {
		max-width: 650px;
		margin: auto;
	}

	.encabezado {
		text-align: center;
		margin-bottom: 35px;
	}

	.etiqueta {
		color: #e87535;
		font-size: 12px;
		font-weight: bold;
		letter-spacing: 2px;
	}

	h1 {
		font-size: clamp(34px, 6vw, 52px);
		margin: 15px 0;
		color: #252522;
	}

	h1 span {
		color: #e87535;
	}

	.encabezado p {
		color: #777;
		line-height: 1.7;
	}

	form {
		background: white;
		padding: 32px;
		border-radius: 18px;
		box-shadow: 0 10px 35px #0000000b;
	}

	label {
		display: block;
		margin: 18px 0 8px;
		font-size: 14px;
		font-weight: bold;
	}

	input, textarea {
		width: 100%;
		padding: 14px;
		border: 1px solid #deded8;
		border-radius: 9px;
		font: inherit;
		outline: none;
		background: #fff;
	}

	input:focus, textarea:focus {
		border-color: #e87535;
	}

	textarea {
		resize: vertical;
	}

	button {
		width: 100%;
		margin-top: 25px;
		padding: 16px;
		border: none;
		border-radius: 9px;
		background: #e87535;
		color: white;
		font-weight: bold;
		font-size: 15px;
		cursor: pointer;
	}

	button:disabled {
		opacity: .6;
		cursor: not-allowed;
	}

	.respuesta {
		color: #23834a;
		text-align: center;
		font-size: 14px;
		line-height: 1.5;
	}

	.respuesta.fallo {
		color: #c0392b;
	}

	@media (max-width: 550px) {
		form { padding: 22px; }
	}
</style>