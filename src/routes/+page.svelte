
<script>
	const categorias = [
		{ nombre: 'Laptops', numero: '01', icono: '💻' },
		{ nombre: 'Computadoras', numero: '02', icono: '🖥️' },
		{ nombre: 'Componentes', numero: '03', icono: '⚙️' },
		{ nombre: 'Periféricos', numero: '04', icono: '⌨️' }
	];
</script>

<svelte:head>
	<title>Inicio | NEXBYTE STORE</title>
</svelte:head>

<section class="hero">
	<div class="hero-content">
		<div class="tag">
			<span></span>
			TECNOLOGÍA PARA EL FUTURO
		</div>

		<h1>
			La tecnología<br />
			que necesitas.<br />
			<span>El rendimiento que buscas.</span>
		</h1>

		<p>
			Descubre computadoras, componentes y accesorios
			seleccionados para llevar tu experiencia tecnológica
			al siguiente nivel.
		</p>

		<div class="buttons">
			<a href="/catalogo" class="primary">Explorar catálogo ↗</a>
			<a href="/nosotros" class="secondary">Conócenos</a>
		</div>

		<div class="hero-info">
			<div>
				<strong>100%</strong>
				<small>Calidad tecnológica</small>
			</div>
			<div>
				<strong>RD</strong>
				<small>Estamos en Baní</small>
			</div>
		</div>
	</div>

	<div class="hero-visual">
		<div class="visual-card">
			<div class="visual-top">
				<span>NEXBYTE STORE</span>
				<span class="online">● ONLINE</span>
			</div>

			<div class="computer">
				<div class="screen">
					<div class="screen-logo">N.</div>
					<div class="screen-text">POWER YOUR<br />DIGITAL WORLD</div>
					<div class="screen-line"></div>
				</div>
				<div class="keyboard"></div>
			</div>

			<div class="visual-bottom">
				<span>TECNOLOGÍA</span>
				<strong>01 / 04</strong>
			</div>
		</div>

		<div class="floating-card">
			<span>✦</span>
			<div>
				<strong>Descubre lo nuevo</strong>
				<small>Tu próxima tecnología está aquí</small>
			</div>
		</div>
	</div>
</section>

<section class="categories">
	<div class="section-heading">
		<div>
			<span class="eyebrow">EXPLORA NUESTRA TIENDA</span>
			<h2>Encuentra lo que necesitas.</h2>
		</div>
		<a href="/categorias">Ver categorías ↗</a>
	</div>

	<div class="category-grid">
		{#each categorias as categoria}
			<a href="/categorias" class="category-card">
				<span class="number">{categoria.numero}</span>
				<span class="category-icon">{categoria.icono}</span>
				<h3>{categoria.nombre}</h3>
				<span class="arrow">↗</span>
			</a>
		{/each}
	</div>
</section>

<section class="bottom-banner">
	<div>
		<span>¿BUSCAS ALGO EN PARTICULAR?</span>
		<h2>Encuentra tu próximo equipo.</h2>
	</div>
	<a href="/contacto">Contáctanos ↗</a>
</section>

<style>
	.hero {
		max-width: 1280px;
		min-height: 590px;
		margin: auto;
		padding: 75px 45px;
		display: grid;
		grid-template-columns: 1.1fr .9fr;
		align-items: center;
		gap: 50px;
	}

	.hero-content {
		max-width: 650px;
	}

	.tag, .eyebrow {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 2px;
		color: #88857d;
	}

	.tag {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.tag span {
		width: 8px;
		height: 8px;
		background: #a7c947;
		border-radius: 50%;
	}

	h1 {
		margin: 25px 0;
		font-size: clamp(38px, 5vw, 65px);
		line-height: 1.08;
		letter-spacing: -3px;
		color: #252522;
	}

	h1 span {
		color: #ff7138;
	}

	.hero-content > p {
		max-width: 480px;
		font-size: 15px;
		line-height: 1.8;
		color: #77746d;
	}

	.buttons {
		display: flex;
		gap: 13px;
		margin-top: 30px;
		flex-wrap: wrap;
	}

	.primary, .secondary {
		padding: 15px 21px;
		border-radius: 7px;
		font-size: 13px;
		font-weight: 700;
		text-decoration: none;
	}

	.primary {
		background: #ff7138;
		color: white;
	}

	.secondary {
		background: white;
		color: #252522;
		border: 1px solid #e8e4dc;
	}

	.hero-info {
		display: flex;
		gap: 45px;
		margin-top: 50px;
	}

	.hero-info div {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.hero-info strong {
		font-size: 22px;
	}

	.hero-info small {
		font-size: 11px;
		color: #88857d;
	}

	.hero-visual {
		position: relative;
		padding: 15px;
	}

	.visual-card {
		background: #252522;
		padding: 22px;
		border-radius: 18px;
		min-height: 390px;
		box-shadow: 0 25px 60px #25252220;
	}

	.visual-top, .visual-bottom {
		display: flex;
		justify-content: space-between;
		color: #aaa79f;
		font-size: 9px;
		letter-spacing: 2px;
	}

	.online {
		color: #a7c947;
	}

	.computer {
		margin: 55px auto 45px;
		width: 85%;
		max-width: 350px;
	}

	.screen {
		height: 190px;
		border: 9px solid #494943;
		border-radius: 9px;
		background: linear-gradient(135deg, #ff7138, #b44d7c 60%, #5746a2);
		padding: 20px;
		color: white;
		position: relative;
		overflow: hidden;
	}

	.screen-logo {
		font-size: 27px;
		font-weight: 900;
	}

	.screen-text {
		margin-top: 22px;
		font-size: 20px;
		font-weight: 900;
		line-height: 1.1;
		letter-spacing: 1px;
	}

	.screen-line {
		position: absolute;
		width: 100px;
		height: 100px;
		border: 1px solid #ffffff70;
		border-radius: 50%;
		right: -20px;
		bottom: -40px;
	}

	.keyboard {
		height: 12px;
		width: 115%;
		margin-left: -7.5%;
		background: linear-gradient(#aaa79f, #65655e);
		border-radius: 2px 2px 9px 9px;
	}

	.floating-card {
		position: absolute;
		right: -10px;
		bottom: 5px;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 15px;
		background: white;
		border-radius: 10px;
		box-shadow: 0 10px 30px #25252215;
	}

	.floating-card > span {
		font-size: 25px;
		color: #ff7138;
	}

	.floating-card div {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.floating-card strong {
		font-size: 11px;
	}

	.floating-card small {
		font-size: 9px;
		color: #88857d;
	}

	.categories {
		background: white;
		padding: 65px max(35px, calc((100% - 1190px) / 2));
	}

	.section-heading {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: 20px;
		margin-bottom: 30px;
	}

	.section-heading h2 {
		margin: 12px 0 0;
		font-size: clamp(25px, 3vw, 35px);
		letter-spacing: -1.5px;
	}

	.section-heading > a {
		font-size: 12px;
		font-weight: 700;
		color: #ff7138;
		text-decoration: none;
	}

	.category-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 15px;
	}

	.category-card {
		position: relative;
		padding: 25px;
		min-height: 185px;
		background: #f8f7f3;
		border: 1px solid #eeece5;
		border-radius: 10px;
		text-decoration: none;
		color: #252522;
		transition: transform .2s, border-color .2s;
	}

	.category-card:hover {
		transform: translateY(-5px);
		border-color: #ff7138;
	}

	.number {
		font-size: 10px;
		color: #aaa69c;
	}

	.category-icon {
		display: block;
		font-size: 31px;
		margin-top: 20px;
	}

	.category-card h3 {
		font-size: 15px;
		margin-top: 12px;
	}

	.arrow {
		position: absolute;
		right: 22px;
		bottom: 22px;
		color: #ff7138;
	}

	.bottom-banner {
		max-width: 1190px;
		margin: 65px auto;
		padding: 35px;
		background: #252522;
		color: white;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
	}

	.bottom-banner span {
		font-size: 9px;
		letter-spacing: 2px;
		color: #aaa79f;
	}

	.bottom-banner h2 {
		font-size: 25px;
		margin-bottom: 0;
	}

	.bottom-banner a {
		padding: 14px 20px;
		background: #ff7138;
		color: white;
		border-radius: 7px;
		text-decoration: none;
		font-size: 12px;
		font-weight: 700;
		white-space: nowrap;
	}

	@media (max-width: 800px) {
		.hero {
			grid-template-columns: 1fr;
			padding: 55px 25px;
		}

		.hero-visual {
			max-width: 520px;
			width: 100%;
			margin: auto;
		}

		.category-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.bottom-banner {
			margin: 40px 20px;
		}
	}

	@media (max-width: 480px) {
		.hero {
			padding: 45px 20px;
		}

		h1 {
			letter-spacing: -2px;
		}

		.hero-info {
			gap: 25px;
		}

		.categories {
			padding: 45px 20px;
		}

		.section-heading {
			align-items: start;
			flex-direction: column;
		}

		.category-card {
			padding: 18px;
			min-height: 160px;
		}

		.bottom-banner {
			padding: 25px;
			align-items: start;
			flex-direction: column;
		}
	}
</style>