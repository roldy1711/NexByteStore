<script>
	import { onMount } from 'svelte';
	import { supabase } from '#lib/supabase';

	let categorias = $state([]);
	let cargando = $state(true);
	let error = $state('');
	// Registra el nivel de respaldo actual por categoría:
	// 0 = image_url de Supabase (si existe) -> 1 = foto real verificada en Wikimedia Commons -> 2 = fotografía secundaria -> 3 = tarjeta visual local garantizada
	let nivelRespaldo = $state({});

	// Enlaces directos y estables de fotografías reales en Wikimedia Commons (endpoint oficial Special:FilePath)
	const IMAGENES_REALES_POR_CATEGORIA = [
		{
			palabrasClave: ['procesador', 'cpu', 'intel', 'amd', 'ryzen', 'core'],
			principal:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Intel_CPU_Core_i7_2600K_Sandy_Bridge_top.jpg?width=640',
			secundaria:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Cpu.jpg?width=640',
			etiqueta: 'PROCESADORES'
		},
		{
			palabrasClave: ['gráfica', 'grafica', 'gpu', 'video', 'nvidia', 'geforce', 'radeon', 'rtx'],
			principal:
				'https://commons.wikimedia.org/wiki/Special:FilePath/NVIDIA_GPU.jpg?width=640',
			secundaria:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Inside_a_desktop_computer_with_MSI_graphics_card.jpg?width=640',
			etiqueta: 'TARJETAS GRÁFICAS'
		},
		{
			palabrasClave: ['ram', 'memoria', 'ddr4', 'ddr5', 'sodimm'],
			principal:
				'https://commons.wikimedia.org/wiki/Special:FilePath/RAM_Module_(SDRAM-DDR4).jpg?width=640',
			secundaria:
				'https://commons.wikimedia.org/wiki/Special:FilePath/DDR4_Ram_IMGP5859_smial_wp.jpg?width=640',
			etiqueta: 'MEMORIAS RAM'
		},
		{
			palabrasClave: ['almacenamiento', 'ssd', 'nvme', 'disco', 'hdd', 'm.2', 'unidad'],
			principal:
				'https://commons.wikimedia.org/wiki/Special:FilePath/NVMe_SSd.jpg?width=640',
			secundaria:
				'https://commons.wikimedia.org/wiki/Special:FilePath/A_2230_NVME_SSD.jpg?width=640',
			etiqueta: 'ALMACENAMIENTO'
		},
		{
			palabrasClave: [
				'periférico',
				'periferico',
				'teclado',
				'mouse',
				'ratón',
				'raton',
				'auricular',
				'headset',
				'accesorio'
			],
			principal:
				'https://commons.wikimedia.org/wiki/Special:FilePath/GamingKeyboard.jpg?width=640',
			secundaria:
				'https://commons.wikimedia.org/wiki/Special:FilePath/CM_Storm_Inferno_Gaming_Mouse.jpg?width=640',
			etiqueta: 'PERIFÉRICOS'
		},
		{
			palabrasClave: ['monitor', 'pantalla', 'display'],
			principal:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Monitor_PC.jpg?width=640',
			secundaria:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Monitor_ultrawide_21_9.jpg?width=640',
			etiqueta: 'MONITORES'
		},
		{
			palabrasClave: ['red', 'redes', 'router', 'switch', 'wifi', 'wi-fi', 'ethernet', 'conectividad'],
			principal:
				'https://commons.wikimedia.org/wiki/Special:FilePath/20150208ipTIME_A2004NS_Wireless_router.jpg?width=640',
			secundaria:
				'https://commons.wikimedia.org/wiki/Special:FilePath/ZyXEL_desktop_Ethernet_switch.jpg?width=640',
			etiqueta: 'REDES'
		},
		{
			palabrasClave: ['computadora', 'pc', 'laptop', 'portátil', 'portatil', 'equipo', 'workstation', 'escritorio'],
			principal:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Informatique_gaming_pc.jpg?width=640',
			secundaria:
				'https://commons.wikimedia.org/wiki/Special:FilePath/Lenovo_ThinkPad_T490.jpg?width=640',
			etiqueta: 'COMPUTADORAS'
		}
	];

	const RESPALDO_GENERAL = {
		principal:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Desktop_Computer_Motherboard.jpg?width=640',
		secundaria:
			'https://commons.wikimedia.org/wiki/Special:FilePath/Laptop_picture.jpg?width=640',
		etiqueta: 'HARDWARE & TECH'
	};

	function obtenerConfigImagen(categoria) {
		const texto = `${categoria?.name || ''} ${categoria?.description || ''}`.toLowerCase();
		const coincidencia = IMAGENES_REALES_POR_CATEGORIA.find((item) =>
			item.palabrasClave.some((palabra) => texto.includes(palabra))
		);
		return coincidencia || RESPALDO_GENERAL;
	}

	function obtenerUrlActual(categoria) {
		const nivel = nivelRespaldo[categoria.id] ?? 0;
		const config = obtenerConfigImagen(categoria);
		const urlSupabase =
			typeof categoria?.image_url === 'string' ? categoria.image_url.trim() : '';

		if (nivel === 0) {
			return urlSupabase || config.principal;
		}
		if (nivel === 1) {
			return urlSupabase ? config.principal : config.secundaria;
		}
		if (nivel === 2 && urlSupabase) {
			return config.secundaria;
		}
		return null;
	}

	function manejarErrorImagen(categoria) {
		const actual = nivelRespaldo[categoria.id] ?? 0;
		const tieneUrlSupabase = Boolean(
			typeof categoria?.image_url === 'string' && categoria.image_url.trim()
		);
		const maxNivel = tieneUrlSupabase ? 3 : 2;

		if (actual < maxNivel) {
			nivelRespaldo = {
				...nivelRespaldo,
				[categoria.id]: actual + 1
			};
		}
	}

	async function cargarCategorias() {
		cargando = true;
		error = '';

		try {
			const { data, error: fallo } = await supabase
				.from('categories')
				.select('*')
				.order('name');

			if (fallo) {
				error = 'No se pudieron cargar las categorías. Inténtalo nuevamente más tarde.';
				console.error('Error al consultar categories en Supabase:', fallo);
				categorias = [];
			} else {
				categorias = Array.isArray(data) ? data : [];
			}
		} catch (err) {
			error = 'Ocurrió un problema de conexión al cargar las categorías.';
			console.error('Error inesperado cargando categorías:', err);
			categorias = [];
		} finally {
			cargando = false;
		}
	}

	onMount(() => {
		cargarCategorias();
	});
</script>

<svelte:head>
	<title>Categorías | NEXBYTE STORE</title>
	<meta
		name="description"
		content="Explora nuestras categorías de hardware, componentes, periféricos y redes en NEXBYTE STORE."
	/>
</svelte:head>

<section class="pagina">
	<div class="encabezado">
		<span>NEXBYTE STORE</span>
		<h1>Explora nuestras <strong>categorías.</strong></h1>
		<p>Encuentra fácilmente el tipo de tecnología que estás buscando.</p>
	</div>

	{#if cargando}
		<p class="estado">Cargando categorías...</p>
	{:else if error}
		<p class="estado error">{error}</p>
	{:else if categorias.length === 0}
		<p class="estado">Todavía no hay categorías disponibles.</p>
	{:else}
		<div class="rejilla">
			{#each categorias as categoria (categoria.id)}
				{@const imagenActual = obtenerUrlActual(categoria)}
				{@const configVisual = obtenerConfigImagen(categoria)}
				<a class="tarjeta" href="/catalogo?categoria={encodeURIComponent(categoria.id)}">
					<div class="imagen">
						{#if imagenActual}
							<img
								src={imagenActual}
								alt={categoria.name}
								loading="lazy"
								onerror={() => manejarErrorImagen(categoria)}
							/>
						{:else}
							<div class="respaldo-local" aria-hidden="true">
								<span>N</span>
								<small>{configVisual.etiqueta}</small>
							</div>
						{/if}
					</div>
					<div class="contenido">
						<h2>{categoria.name}</h2>
						<p>{categoria.description || 'Explora nuestros productos de esta categoría.'}</p>
						<span>Ver productos →</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>

<style>
	.pagina {
		max-width: 1200px;
		margin: auto;
		padding: 70px 22px 90px;
	}

	.encabezado {
		text-align: center;
		margin-bottom: 45px;
	}

	.encabezado > span {
		color: #e87535;
		font-size: 12px;
		font-weight: bold;
		letter-spacing: 2px;
	}

	h1 {
		font-size: clamp(32px, 5vw, 50px);
		margin: 14px 0;
	}

	h1 strong {
		color: #e87535;
	}

	.encabezado p {
		color: #777;
	}

	.rejilla {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 22px;
	}

	.tarjeta {
		background: white;
		border: 1px solid #eee;
		border-radius: 16px;
		overflow: hidden;
		text-decoration: none;
		color: #252522;
		display: flex;
		flex-direction: column;
		transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
	}

	.tarjeta:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 28px #0000000c;
		border-color: #e8753544;
	}

	.imagen {
		height: 165px;
		background: #efede7;
		display: grid;
		place-items: center;
		overflow: hidden;
		position: relative;
	}

	.imagen img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		display: block;
		transition: transform 0.35s ease;
	}

	.tarjeta:hover .imagen img {
		transform: scale(1.04);
	}

	.respaldo-local {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
	}

	.respaldo-local span {
		color: #e87535;
		font-size: 56px;
		font-weight: bold;
		line-height: 1;
	}

	.respaldo-local small {
		color: #777;
		font-size: 10px;
		font-weight: bold;
		letter-spacing: 1.5px;
	}

	.contenido {
		padding: 22px;
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.contenido h2 {
		margin: 0 0 10px;
		font-size: 20px;
	}

	.contenido p {
		color: #777;
		line-height: 1.6;
		font-size: 14px;
		min-height: 44px;
		margin: 0 0 14px;
		flex: 1;
	}

	.contenido span {
		color: #e87535;
		font-size: 14px;
		font-weight: bold;
		display: inline-flex;
		align-items: center;
	}

	.estado {
		text-align: center;
		padding: 45px 20px;
		color: #777;
	}

	.error {
		color: #c0392b;
	}

	@media (max-width: 600px) {
		.pagina {
			padding: 50px 16px 70px;
		}

		.rejilla {
			grid-template-columns: 1fr;
			gap: 18px;
		}

		.imagen {
			height: 180px;
		}
	}
</style>