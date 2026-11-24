<script>
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { supabase } from '#lib/supabase';
import { authState, initializeAuth, logoutUser } from '#lib/auth.svelte.js';

let loading = $state(true);
let error = $state('');
let requests = $state([]);

onMount(async () => {
  try {
    await initializeAuth();
    if (authState.loading) throw new Error('La autenticación no terminó. Recarga la página.');
    if (!authState.user) { await goto('/login'); return; }
    if (!authState.profile) throw new Error(authState.error || 'No se encontró tu perfil.');
    if (authState.profile.role === 'admin') { await goto('/admin'); return; }
    if (authState.profile.role !== 'user') throw new Error('Tu cuenta no tiene un rol válido.');
    const { data, error: queryError } = await supabase.from('product_requests')
      .select('id, product_name, details, status, created_at')
      .ilike('email', authState.user.email).order('created_at', { ascending: false });
    if (queryError) throw queryError;
    requests = data || [];
  } catch (e) {
    error = e?.message || 'No se pudo cargar tu cuenta.';
    console.error('[NEXBYTE CUENTA]', e);
  } finally { loading = false; }
});

async function signOut() {
  const result = await logoutUser();
  if (result.error) { error = result.error.message; return; }
  await goto('/');
}
</script>

<svelte:head><title>Mi cuenta | NEXBYTE STORE</title></svelte:head>
{#if loading}
  <main class="center">Verificando tu cuenta...</main>
{:else if error}
  <main class="center"><section class="errorbox"><h1>No se pudo abrir tu cuenta</h1><p>{error}</p><a href="/login">Volver a iniciar sesión</a></section></main>
{:else if authState.user && authState.profile?.role === 'user'}
  <main class="wrap">
    <small class="eyebrow">ÁREA DE CLIENTES</small><h1>Mi cuenta</h1>
    <section class="profile"><div class="avatar">{(authState.profile.full_name || authState.user.email || 'U').charAt(0).toUpperCase()}</div><div><h2>{authState.profile.full_name || 'Cliente NEXBYTE'}</h2><p>{authState.user.email}</p><small>Cuenta de cliente</small></div></section>
    <section><div class="heading"><h2>Mis solicitudes</h2><a class="button" href="/solicitar-producto">Solicitar producto</a></div>
      {#each requests as x}
        <article class="request"><div><b>{x.product_name}</b><p>{x.details || 'Sin detalles adicionales.'}</p><small>{new Date(x.created_at).toLocaleDateString('es-DO')}</small></div><span>{x.status}</span></article>
      {:else}<p>Aún no tienes solicitudes. <a href="/catalogo">Explora el catálogo</a>.</p>{/each}
    </section>
    <nav><a href="/catalogo">Catálogo</a><a href="/categorias">Categorías</a><a href="/contacto">Contacto</a></nav>
    <button class="logout" onclick={signOut}>Cerrar sesión</button>
  </main>
{/if}
<style>
:global(body){margin:0;background:#f7f6f3;color:#252525;font-family:Arial,sans-serif}.wrap{max-width:850px;margin:50px auto;padding:0 20px 60px}.eyebrow{color:#df7938;letter-spacing:1.4px;font-weight:bold}.wrap h1{font-size:35px}.profile,section{background:white;border:1px solid #e9e5df;border-radius:13px;padding:20px;margin:17px 0}.profile{display:flex;gap:16px;align-items:center}.avatar{width:55px;height:55px;border-radius:50%;display:grid;place-items:center;background:#fff0e5;color:#c65e25;font-size:23px;font-weight:bold}.profile h2,.profile p{margin:4px 0}.profile p,small{color:#777}.heading,.request{display:flex;justify-content:space-between;align-items:center;gap:15px}.button{background:#e77e3d;color:white;text-decoration:none;padding:10px 13px;border-radius:7px;font-weight:bold;font-size:13px}.request{padding:15px 0;border-top:1px solid #eee}.request p{color:#666}.request span{background:#fff0e5;color:#a95620;border-radius:20px;padding:7px 10px;font-size:12px}nav{display:flex;gap:17px;flex-wrap:wrap;margin:20px 0}a{color:#b85b27}.logout{padding:10px 15px;background:white;border:1px solid #ddd;border-radius:7px;cursor:pointer}.center{min-height:60vh;display:grid;place-content:center;text-align:center;padding:24px}.errorbox{max-width:600px;background:white;padding:25px;border:1px solid #edc8bb;border-radius:12px}.errorbox p{color:#a33;line-height:1.6}@media(max-width:550px){.heading,.request{align-items:flex-start;flex-direction:column}.wrap h1{font-size:29px}}
</style>