
<script>
	import { onMount } from 'svelte';
	import { supabase } from '#lib/supabase';

	let productos = $state([]);
	let categorias = $state([]);
	let categoriaSeleccionada = $state('todas');
	let cargando = $state(true);
	let error = $state('');
	let imagenesConError = $state({});

	// Evita que una consulta deje la página cargando indefinidamente.
	function conTiempoLimite(promesa, milisegundos = 12000) {
		let temporizador;

		return Promise.race([
			promesa,
			new Promise((_, reject) => {
				temporizador = setTimeout(() => {
					reject(
						new Error('La conexión tardó demasiado. Comprueba tu conexión e inténtalo nuevamente.')
					);
				}, milisegundos);
			})
		]).finally(() => clearTimeout(temporizador));
	}

	// Identifica la categoría de cada producto.
	let mapaCategorias = $derived.by(() => {
		const mapa = {};

		for (const categoria of categorias) {
			mapa[String(categoria.id)] = (categoria.name || '').toLowerCase();
		}

		return mapa;
	});

	// Filtra los productos según la categoría seleccionada.
	let productosFiltrados = $derived.by(() => {
		if (categoriaSeleccionada === 'todas') {
			return productos;
		}

		return productos.filter(
			(producto) =>
				String(producto.category_id) === String(categoriaSeleccionada)
		);
	});

	// Ilustraciones SVG locales para productos sin fotografía.
	function obtenerRespaldoVisual(producto) {
		const nombre = (producto?.name || '').toLowerCase();
		const descripcion = (producto?.description || '').toLowerCase();
		const categoria = mapaCategorias[String(producto?.category_id)] || '';
		const texto = `${nombre} ${descripcion} ${categoria}`;

		if (
			/\b(gpu|rtx|gtx|radeon|tarjeta gráfica|tarjeta grafica|gráfica|grafica)\b/.test(texto)
		) {
			return {
				tipo: 'TARJETA GRÁFICA',
				subtitulo: 'Gráficos de alto rendimiento',
				svg: `<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="14" y="18" width="92" height="44" rx="8" fill="#1f1f23" stroke="#e87535" stroke-width="2.5"/>
					<circle cx="44" cy="40" r="13" fill="#2c2c32" stroke="#e87535" stroke-width="2"/>
					<circle cx="76" cy="40" r="13" fill="#2c2c32" stroke="#e87535" stroke-width="2"/>
					<rect x="24" y="62" width="66" height="5" rx="2" fill="#e87535"/>
				</svg>`
			};
		}

		if (
			/\b(ram|memoria|ddr4|ddr5|ssd|nvme|disco|almacenamiento)\b/.test(texto)
		) {
			return {
				tipo: 'MEMORIA / STORAGE',
				subtitulo: 'Velocidad y almacenamiento',
				svg: `<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="16" y="25" width="88" height="28" rx="5" fill="#1f1f23" stroke="#e87535" stroke-width="2.2"/>
					<rect x="28" y="32" width="12" height="14" rx="2" fill="#e87535"/>
					<rect x="46" y="32" width="12" height="14" rx="2" fill="#52525b"/>
					<rect x="64" y="32" width="12" height="14" rx="2" fill="#e87535"/>
					<rect x="82" y="32" width="12" height="14" rx="2" fill="#52525b"/>
					<path d="M22 53V58M36 53V58M50 53V58M64 53V58M78 53V58M92 53V58" stroke="#e87535" stroke-width="2"/>
				</svg>`
			};
		}

		if (
			/\b(teclado|mouse|ratón|raton|auriculares|headset|micrófono|microfono|periférico|periferico)\b/.test(texto)
		) {
			return {
				tipo: 'PERIFÉRICO',
				subtitulo: 'Precisión y control',
				svg: `<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="18" y="24" width="60" height="32" rx="6" fill="#1f1f23" stroke="#e87535" stroke-width="2.2"/>
					<rect x="25" y="31" width="8" height="7" rx="1.5" fill="#e87535"/>
					<rect x="37" y="31" width="8" height="7" rx="1.5" fill="#fff"/>
					<rect x="49" y="31" width="8" height="7" rx="1.5" fill="#fff"/>
					<rect x="61" y="31" width="10" height="7" rx="1.5" fill="#fff"/>
					<rect x="25" y="42" width="46" height="7" rx="1.5" fill="#3f3f46"/>
					<rect x="86" y="24" width="18" height="32" rx="9" fill="#1f1f23" stroke="#e87535" stroke-width="2.2"/>
					<path d="M95 29V37" stroke="#e87535" stroke-width="2.2" stroke-linecap="round"/>
				</svg>`
			};
		}

		if (
			/\b(router|redes|switch|wifi|wi-fi|servidor|cable de red)\b/.test(texto)
		) {
			return {
				tipo: 'REDES',
				subtitulo: 'Conectividad estable',
				svg: `<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="60" cy="44" r="10" fill="#e87535"/>
					<path d="M40 32C45.5 26.5 52.5 23.5 60 23.5C67.5 23.5 74.5 26.5 80 32" stroke="#1f1f23" stroke-width="2.6" stroke-linecap="round"/>
					<path d="M31 23C39 15 49.2 11 60 11C70.8 11 81 15 89 23" stroke="#e87535" stroke-width="2.6" stroke-linecap="round"/>
					<rect x="26" y="54" width="68" height="12" rx="4" fill="#1f1f23"/>
				</svg>`
			};
		}

		if (
			/\b(laptop|computadora|monitor|pantalla|workstation|torre|gabinete|pc de escritorio)\b/.test(texto)
		) {
			return {
				tipo: 'COMPUTADORA',
				subtitulo: 'Rendimiento y tecnología',
				svg: `<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="24" y="16" width="72" height="44" rx="5" fill="#1f1f23" stroke="#e87535" stroke-width="2.4"/>
					<rect x="30" y="22" width="60" height="32" rx="2" fill="#2b2b30"/>
					<path d="M14 63H106" stroke="#1f1f23" stroke-width="4" stroke-linecap="round"/>
					<rect x="52" y="61" width="16" height="3" rx="1.5" fill="#e87535"/>
				</svg>`
			};
		}

		return {
			tipo: 'NEXBYTE STORE',
			subtitulo: 'Tecnología y hardware',
			svg: `<svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="32" y="14" width="56" height="52" rx="10" fill="#1f1f23" stroke="#e87535" stroke-width="2.5"/>
				<path d="M46 50V30L64 50V30" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
				<circle cx="74" cy="33" r="4" fill="#e87535"/>
			</svg>`
		};
	}

	// Comprueba que la dirección de la imagen tenga un formato válido.
	function obtenerUrlImagen(producto) {
		const url = producto?.image_url;

		if (typeof url !== 'string' || !url.trim()) {
			return '';
		}

		try {
			const direccion = new URL(url.trim());

			if (direccion.protocol !== 'https:' && direccion.protocol !== 'http:') {
				return '';
			}

			return direccion.href;
		} catch {
			return '';
		}
	}

	function debeMostrarImagenReal(producto) {
		return Boolean(
			obtenerUrlImagen(producto) &&
			!imagenesConError[String(producto.id)]
		);
	}

	function manejarErrorImagen(productoId) {
		imagenesConError = {
			...imagenesConError,
			[String(productoId)]: true
		};
	}

	function formatoPrecio(precio) {
		const valor = Number(precio);

		if (!Number.isFinite(valor)) {
			return 'RD$ 0.00';
		}

		return new Intl.NumberFormat('es-DO', {
			style: 'currency',
			currency: 'DOP',
			minimumFractionDigits: 2
		}).format(valor);
	}

	async function cargarCatalogo() {
		cargando = true;
		error = '';

		try {
			const parametros = new URLSearchParams(window.location.search);
			const categoriaURL = parametros.get('categoria');

			const [resultadoProductos, resultadoCategorias] = await conTiempoLimite(
				Promise.all([
					supabase
						.from('products')
						.select('id, name, description, price, stock, image_url, category_id, is_active, created_at')
						.eq('is_active', true)
						.order('created_at', { ascending: false }),

					supabase
						.from('categories')
						.select('id, name')
						.order('name', { ascending: true })
				])
			);

			if (resultadoProductos.error) {
				throw resultadoProductos.error;
			}

			if (resultadoCategorias.error) {
				throw resultadoCategorias.error;
			}

			productos = Array.isArray(resultadoProductos.data)
				? resultadoProductos.data
				: [];

			categorias = Array.isArray(resultadoCategorias.data)
				? resultadoCategorias.data
				: [];

			// Reinicia los errores de imágenes al volver a cargar.
			imagenesConError = {};

			if (categoriaURL) {
				const existe = categorias.some(
					(categoria) =>
						String(categoria.id) === String(categoriaURL)
				);

				categoriaSeleccionada = existe ? categoriaURL : 'todas';
			} else {
				categoriaSeleccionada = 'todas';
			}
		} catch (err) {
			console.error('Error al cargar el catálogo:', err);

			error = err?.message?.includes('tardó demasiado')
				? err.message
				: 'No se pudieron cargar los productos. Comprueba tu conexión e inténtalo más tarde.';

			productos = [];
			categorias = [];
			categoriaSeleccionada = 'todas';
		} finally {
			cargando = false;
		}
	}

	onMount(() => {
		void cargarCatalogo();
	});
</script>

<svelte:head>
	<title>Catálogo | NEXBYTE STORE</title>
	<meta
		name="description"
		content="Explora los productos tecnológicos de NEXBYTE STORE en Baní, República Dominicana."
	/>
</svelte:head>

<section class="catalogo">
	<div class="encabezado">
		<span class="etiqueta">NEXBYTE STORE</span>
		<h1>Nuestro <span>catálogo.</span></h1>
		<p>Encuentra la tecnología que necesitas en un solo lugar.</p>
	</div>

	<div class="filtros">
		<label for="categoria">Filtrar por categoría</label>

		<select id="categoria" bind:value={categoriaSeleccionada}>
			<option value="todas">Todas las categorías</option>

			{#each categorias as categoria (categoria.id)}
				<option value={String(categoria.id)}>
					{categoria.name}
				</option>
			{/each}
		</select>
	</div>

	{#if cargando}
		<p class="estado">Cargando productos...</p>

	{:else if error}
		<div class="estado error">
			<p>{error}</p>
			<button class="reintentar" onclick={cargarCatalogo}>
				Intentar nuevamente
			</button>
		</div>

	{:else if productosFiltrados.length === 0}
		<div class="vacio">
			<h2>No hay productos disponibles</h2>
			<p>
				Pronto agregaremos nuevos productos a nuestro catálogo.
			</p>
		</div>

	{:else}
		<div class="productos">
			{#each productosFiltrados as producto (producto.id)}
				{@const respaldo = obtenerRespaldoVisual(producto)}
				{@const tieneStock = Number(producto.stock) > 0}
				{@const urlImagen = obtenerUrlImagen(producto)}

				<article class="tarjeta">
					<div class="imagen">
						{#if debeMostrarImagenReal(producto)}
							<img
								src={urlImagen}
								alt={producto.name || 'Producto tecnológico'}
								loading="lazy"
								onerror={() => manejarErrorImagen(producto.id)}
							/>
						{:else}
							<div
								class="respaldo-visual"
								role="img"
								aria-label={`Ilustración de ${respaldo.tipo}: ${producto.name}`}
							>
								<div class="respaldo-svg">
									{@html respaldo.svg}
								</div>

								<span class="respaldo-etiqueta">
									{respaldo.tipo}
								</span>

								<small>{respaldo.subtitulo}</small>
							</div>
						{/if}
					</div>

					<div class="informacion">
						<span
							class="stock"
							class:agotado={!tieneStock}
						>
							{tieneStock ? 'Disponible' : 'Agotado'}
						</span>

						<h2>{producto.name}</h2>

						<p>
							{producto.description ||
								'Producto tecnológico de NEXBYTE STORE.'}
						</p>

						<strong>{formatoPrecio(producto.price)}</strong>

						<a href="/solicitar-producto">
							Consultar producto →
						</a>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</section>

<style>
	.catalogo {
		max-width: 1200px;
		margin: auto;
		padding: 65px 22px 90px;
	}

	.encabezado {
		text-align: center;
		margin-bottom: 40px;
	}

	.etiqueta {
		color: #e87535;
		font-size: 12px;
		font-weight: bold;
		letter-spacing: 2px;
	}

	h1 {
		font-size: clamp(36px, 6vw, 54px);
		margin: 12px 0;
	}

	h1 span {
		color: #e87535;
	}

	.encabezado p {
		color: #777;
	}

	.filtros {
		display: flex;
		align-items: center;
		gap: 15px;
		margin-bottom: 30px;
		flex-wrap: wrap;
	}

	.filtros label {
		font-weight: bold;
		font-size: 14px;
	}

	select {
		padding: 12px 15px;
		border: 1px solid #ddd;
		border-radius: 9px;
		background: white;
		font: inherit;
		color: inherit;
		cursor: pointer;
	}

	.productos {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(235px, 1fr));
		gap: 22px;
	}

	.tarjeta {
		background: white;
		border: 1px solid #eee;
		border-radius: 15px;
		overflow: hidden;
		transition: transform .2s, box-shadow .2s;
	}

	.tarjeta:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 28px #0000000c;
	}

	.imagen {
		height: 190px;
		background: #f0eee9;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12px;
		overflow: hidden;
	}

	.imagen img {
		display: block;
		max-width: 100%;
		max-height: 100%;
		width: auto;
		height: auto;
		object-fit: contain;
		border-radius: 8px;
	}

	.respaldo-visual {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 4px;
	}

	.respaldo-svg {
		width: 96px;
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.respaldo-svg :global(svg) {
		width: 100%;
		height: 100%;
	}

	.respaldo-etiqueta {
		font-size: 11px;
		font-weight: bold;
		letter-spacing: 1.5px;
		color: #e87535;
	}

	.respaldo-visual small {
		font-size: 11px;
		color: #777;
	}

	.informacion {
		padding: 20px;
	}

	.stock {
		color: #27834c;
		font-size: 12px;
		font-weight: bold;
	}

	.stock.agotado {
		color: #c0392b;
	}

	.informacion h2 {
		font-size: 19px;
		margin: 10px 0;
	}

	.informacion p {
		color: #777;
		font-size: 13px;
		line-height: 1.6;
		min-height: 42px;
	}

	.informacion strong {
		display: block;
		font-size: 19px;
		margin: 15px 0;
	}

	.informacion a {
		display: inline-block;
		color: #e87535;
		font-weight: bold;
		text-decoration: none;
		font-size: 14px;
	}

	.informacion a:hover {
		text-decoration: underline;
	}

	.estado,
	.vacio {
		text-align: center;
		padding: 50px 15px;
		color: #777;
	}

	.error {
		color: #c0392b;
	}

	.reintentar {
		margin-top: 15px;
		padding: 11px 20px;
		background: #e87535;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: bold;
		cursor: pointer;
	}

	.reintentar:hover {
		background: #cf6025;
	}

	@media (max-width: 550px) {
		.catalogo {
			padding: 45px 16px 65px;
		}

		.filtros {
			align-items: flex-start;
			flex-direction: column;
		}

		select {
			width: 100%;
		}

		.productos {
			grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		}
	}
</style>
