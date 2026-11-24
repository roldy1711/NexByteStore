
<svelte:head>
	<title>Nosotros | NEXBYTE STORE</title>
	<meta name="description" content="Conoce NEXBYTE STORE, nuestra visión y compromiso con la tecnología." />
</svelte:head>

<section class="pagina">
	<div class="hero">
		<span class="etiqueta">CONÓCENOS</span>
		<h1>La tecnología es parte del <strong>futuro.</strong></h1>
		<p>
			En NEXBYTE STORE creemos que la tecnología debe estar al alcance
			de todos. Por eso buscamos ofrecer productos tecnológicos que
			ayuden a las personas a estudiar, trabajar y crecer.
		</p>
		<a href="/catalogo">Explorar catálogo →</a>
	</div>

	<div class="bloques">
		<article>
			<span>01</span>
			<h2>Nuestra misión</h2>
			<p>
				Ofrecer productos tecnológicos de calidad y brindar una
				atención responsable, cercana y confiable a nuestros clientes.
			</p>
		</article>

		<article>
			<span>02</span>
			<h2>Nuestra visión</h2>
			<p>
				Convertirnos en una tienda tecnológica reconocida por su
				servicio, innovación y compromiso con las necesidades de
				cada cliente.
			</p>
		</article>

		<article>
			<span>03</span>
			<h2>Nuestros valores</h2>
			<p>
				Trabajamos con responsabilidad, honestidad, respeto y
				dedicación para construir una buena relación con nuestros
				clientes.
			</p>
		</article>
	</div>

	<div class="ubicacion">
		<h2>NEXBYTE STORE</h2>
		<p>Tu espacio para descubrir nuevas posibilidades tecnológicas.</p>
		<span>Baní, República Dominicana</span>
	</div>
</section>

<style>
	.pagina { max-width: 1150px; margin: auto; padding: 75px 22px; }
	.hero {
		background: #252522; color: white; padding: 65px;
		border-radius: 22px; text-align: center;
	}
	.etiqueta { color: #f18a4d; font-size: 12px; font-weight: bold; letter-spacing: 2px; }
	h1 { font-size: clamp(35px, 6vw, 58px); max-width: 800px; margin: 18px auto; }
	h1 strong { color: #f18a4d; }
	.hero p { max-width: 700px; margin: 0 auto 28px; color: #d2d0ca; line-height: 1.8; }
	.hero a {
		display: inline-block; background: #e87535; color: white;
		padding: 14px 23px; border-radius: 8px; text-decoration: none;
		font-weight: bold;
	}
	.bloques {
		display: grid; grid-template-columns: repeat(3, 1fr);
		gap: 22px; margin: 55px 0;
	}
	.bloques article {
		background: white; padding: 28px; border: 1px solid #eee;
		border-radius: 15px;
	}
	.bloques article > span { color: #e87535; font-weight: bold; }
	.bloques h2 { font-size: 21px; }
	.bloques p { color: #777; line-height: 1.7; font-size: 14px; }
	.ubicacion { text-align: center; padding: 35px 15px; }
	.ubicacion h2 { letter-spacing: 3px; }
	.ubicacion p { color: #777; }
	.ubicacion span { color: #e87535; font-weight: bold; font-size: 14px; }

	@media (max-width: 700px) {
		.hero { padding: 40px 22px; }
		.bloques { grid-template-columns: 1fr; }
	}
</style>
