
<script>
	import { goto } from '$app/navigation';
	import { authState, logoutUser } from '#lib/auth.svelte.js';

	let menuAbierto = $state(false);
	let cerrandoSesion = $state(false);

	async function cerrarSesion() {
		cerrandoSesion = true;

		const { error } = await logoutUser();

		cerrandoSesion = false;
		menuAbierto = false;

		if (error) {
			console.error('No se pudo cerrar sesión:', error.message);
			return;
		}

		await goto('/');
	}
</script>

<header class="header">
	<div class="nav-container">
		<a href="/" class="logo" onclick={() => menuAbierto = false}>
			<span class="logo-icon">N</span>
			<span class="logo-text">NEXBYTE<span>.</span></span>
			<small>STORE</small>
		</a>

		<nav class:open={menuAbierto}>
			<a href="/" onclick={() => menuAbierto = false}>Inicio</a>
			<a href="/catalogo" onclick={() => menuAbierto = false}>Catálogo</a>
			<a href="/categorias" onclick={() => menuAbierto = false}>Categorías</a>
			<a href="/nosotros" onclick={() => menuAbierto = false}>Nosotros</a>
			<a href="/contacto" onclick={() => menuAbierto = false}>Contacto</a>
			<a href="/solicitar-producto" onclick={() => menuAbierto = false}>Solicitar producto</a>

			{#if authState.loading}
				<span class="estado">Comprobando cuenta...</span>

			{:else if authState.user && authState.profile?.role === 'admin'}
				<a class="admin-link" href="/admin" onclick={() => menuAbierto = false}>
					Panel Admin
				</a>
				<button class="logout" onclick={cerrarSesion} disabled={cerrandoSesion}>
					{cerrandoSesion ? 'Saliendo...' : 'Cerrar sesión'}
				</button>

			{:else if authState.user}
				<a class="account" href="/cuenta" onclick={() => menuAbierto = false}>
					Mi cuenta
				</a>
				<button class="logout" onclick={cerrarSesion} disabled={cerrandoSesion}>
					{cerrandoSesion ? 'Saliendo...' : 'Cerrar sesión'}
				</button>

			{:else}
				<a class="account" href="/login" onclick={() => menuAbierto = false}>
					Iniciar sesión
				</a>
				<a class="register" href="/registro" onclick={() => menuAbierto = false}>
					Crear cuenta
				</a>
			{/if}
		</nav>

		<button
			class="menu-button"
			onclick={() => menuAbierto = !menuAbierto}
			aria-label="Abrir o cerrar menú"
			aria-expanded={menuAbierto}
		>
			{menuAbierto ? '✕' : '☰'}
		</button>
	</div>
</header>

<style>
	.header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: #fff;
		border-bottom: 1px solid #eee;
	}

	.nav-container {
		max-width: 1250px;
		min-height: 76px;
		margin: auto;
		padding: 12px 22px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 7px;
		text-decoration: none;
		color: #252522;
		font-weight: bold;
	}

	.logo-icon {
		display: grid;
		place-items: center;
		width: 35px;
		height: 35px;
		background: #e87535;
		color: white;
		border-radius: 9px;
		font-size: 20px;
	}

	.logo-text { font-size: 19px; }
	.logo-text span { color: #e87535; }
	.logo small {
		align-self: flex-end;
		font-size: 9px;
		letter-spacing: 2px;
		color: #777;
		margin-bottom: 3px;
	}

	nav {
		display: flex;
		align-items: center;
		gap: 17px;
	}

	nav a {
		color: #444;
		text-decoration: none;
		font-size: 13px;
		font-weight: 600;
	}

	nav a:hover { color: #e87535; }

	nav .account,
	nav .register,
	nav .admin-link {
		padding: 11px 15px;
		border-radius: 8px;
		background: #f5eee8;
		color: #bd5a26;
	}

	nav .register {
		background: #e87535;
		color: white;
	}

	nav .admin-link {
		background: #252522;
		color: white;
	}

	.logout {
		border: 0;
		background: transparent;
		color: #b94c36;
		font-weight: bold;
		font-size: 13px;
		cursor: pointer;
	}

	.logout:disabled { opacity: .5; }
	.estado { font-size: 12px; color: #777; }

	.menu-button {
		display: none;
		background: none;
		border: 0;
		font-size: 25px;
		cursor: pointer;
		color: #252522;
	}

	@media (max-width: 950px) {
		.menu-button { display: block; }

		nav {
			display: none;
			position: absolute;
			top: 76px;
			left: 0;
			right: 0;
			padding: 22px;
			background: white;
			border-bottom: 1px solid #eee;
			flex-direction: column;
			align-items: stretch;
			gap: 18px;
		}

		nav.open { display: flex; }
		nav a, nav button { text-align: left; }
	}
</style>