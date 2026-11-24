<script>
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { supabase } from '#lib/supabase';
import {
  authState,
  initializeAuth,
  logoutUser
} from '#lib/auth.svelte.js';

let loading = $state(true);
let busy = $state(false);
let error = $state('');
let notice = $state('');
let tab = $state('products');

let products = $state([]);
let categories = $state([]);
let messages = $state([]);
let requests = $state([]);

let editProduct = $state(null);
let editCategory = $state(null);

let p = $state({
  name: '',
  description: '',
  price: '',
  stock: '',
  image_url: '',
  category_id: '',
  is_active: true
});

let c = $state({
  name: '',
  slug: '',
  description: '',
  image_url: ''
});

const money = (n) =>
  new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(Number(n || 0));

const slugify = (s) =>
  s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function timeout(promise, ms = 10000) {
  let timer;

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(
          new Error('Supabase tardó demasiado en responder. Revisa la conexión y los permisos.')
        ),
        ms
      );
    })
  ]).finally(() => clearTimeout(timer));
}

onMount(async () => {
  try {
    await timeout(
      initializeAuth(),
      12000
    );

    if (!authState.user) {
      await goto('/login');
      return;
    }

    if (!authState.profile) {
      throw new Error(
        authState.error || 'No se pudo obtener el perfil de administrador.'
      );
    }

    if (authState.profile.role !== 'admin') {
      await goto('/cuenta');
      return;
    }

    await refresh();

  } catch (e) {
    error = e.message || 'No se pudo abrir el panel.';
    console.error('ADMIN ERROR:', e);

  } finally {
    loading = false;
  }
});

async function refresh() {
  error = '';

  try {
    const results = await timeout(
      Promise.all([
        supabase.from('products')
          .select('*')
          .order('created_at', { ascending: false }),

        supabase.from('categories')
          .select('*')
          .order('name'),

        supabase.from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),

        supabase.from('product_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)
      ])
    );

    const [a, b, d, e] = results;

    for (const result of results) {
      if (result.error) throw result.error;
    }

    products = a.data || [];
    categories = b.data || [];
    messages = d.data || [];
    requests = e.data || [];

  } catch (e) {
    error = e.message || 'Error cargando los datos.';
    console.error('REFRESH ERROR:', e);
  }
}

function resetP() {
  editProduct = null;

  p = {
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    category_id: '',
    is_active: true
  };
}

function resetC() {
  editCategory = null;

  c = {
    name: '',
    slug: '',
    description: '',
    image_url: ''
  };
}

function setP(x) {
  editProduct = x.id;

  p = {
    name: x.name || '',
    description: x.description || '',
    price: x.price,
    stock: x.stock,
    image_url: x.image_url || '',
    category_id: x.category_id || '',
    is_active: x.is_active !== false
  };

  tab = 'products';
}

function setC(x) {
  editCategory = x.id;

  c = {
    name: x.name || '',
    slug: x.slug || '',
    description: x.description || '',
    image_url: x.image_url || ''
  };

  tab = 'categories';
}

async function saveP(event) {
  event.preventDefault();

  error = '';
  notice = '';

  const price = Number(p.price);
  const stock = Number(p.stock);

  if (
    !p.name.trim() ||
    p.price === '' ||
    p.stock === '' ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    error = 'Revisa el nombre, precio y stock.';
    return;
  }

  busy = true;

  try {
    const data = {
      name: p.name.trim(),
      description: p.description.trim(),
      price,
      stock,
      image_url: p.image_url.trim() || null,
      category_id: p.category_id || null,
      is_active: !!p.is_active,
      updated_at: new Date().toISOString()
    };

    const result = editProduct
      ? await supabase.from('products').update(data).eq('id', editProduct)
      : await supabase.from('products').insert(data);

    if (result.error) throw result.error;

    notice = 'Producto guardado correctamente.';
    resetP();
    await refresh();

  } catch (e) {
    error = e.message;
  } finally {
    busy = false;
  }
}

async function deleteP(id) {
  if (!confirm('¿Eliminar este producto?')) return;

  try {
    const { error: e } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (e) throw e;

    notice = 'Producto eliminado.';
    await refresh();

  } catch (e) {
    error = e.message;
  }
}

async function saveC(event) {
  event.preventDefault();

  error = '';
  notice = '';

  if (!c.name.trim()) {
    error = 'Escribe el nombre de la categoría.';
    return;
  }

  busy = true;

  try {
    const data = {
      name: c.name.trim(),
      slug: c.slug.trim() || slugify(c.name),
      description: c.description.trim(),
      image_url: c.image_url.trim() || null
    };

    const result = editCategory
      ? await supabase.from('categories').update(data).eq('id', editCategory)
      : await supabase.from('categories').insert(data);

    if (result.error) throw result.error;

    notice = 'Categoría guardada.';
    resetC();
    await refresh();

  } catch (e) {
    error = e.message;
  } finally {
    busy = false;
  }
}

async function deleteC(id) {
  if (products.some(x => x.category_id === id)) {
    error = 'Primero reasigna o elimina los productos de esta categoría.';
    return;
  }

  if (!confirm('¿Eliminar esta categoría?')) return;

  try {
    const { error: e } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (e) throw e;

    notice = 'Categoría eliminada.';
    await refresh();

  } catch (e) {
    error = e.message;
  }
}

async function setStatus(id, status) {
  try {
    const { error: e } = await supabase
      .from('product_requests')
      .update({ status })
      .eq('id', id);

    if (e) throw e;

    notice = 'Estado actualizado.';
    await refresh();

  } catch (e) {
    error = e.message;
  }
}

async function signOut() {
  const result = await logoutUser();

  if (result.error) {
    error = result.error.message;
    return;
  }

  await goto('/');
}
</script>

<svelte:head>
  <title>Administración | NEXBYTE STORE</title>
  <meta name="robots" content="noindex,nofollow">
</svelte:head>

{#if loading}
  <main class="center">
    <h2>Verificando acceso...</h2>
    <p>Comprobando tu cuenta de administrador.</p>
  </main>

{:else if authState.profile?.role === 'admin'}

  <div class="layout">
    <aside>
      <a class="brand" href="/">NEXBYTE <b>STORE</b></a>

      <p>ADMINISTRACIÓN</p>

      <button class:active={tab === 'products'} onclick={() => tab = 'products'}>
        Productos e inventario
      </button>

      <button class:active={tab === 'categories'} onclick={() => tab = 'categories'}>
        Categorías
      </button>

      <button class:active={tab === 'requests'} onclick={() => tab = 'requests'}>
        Solicitudes
      </button>

      <button class:active={tab === 'messages'} onclick={() => tab = 'messages'}>
        Mensajes
      </button>

      <div class="bottom">
        <small>{authState.profile.full_name || authState.user?.email}</small>
        <button onclick={signOut}>Cerrar sesión</button>
        <a href="/">Volver a la tienda</a>
      </div>
    </aside>

    <main class="main">
      <header>
        <div>
          <small>PANEL DE CONTROL</small>
          <h1>Administración</h1>
        </div>
        <span>Administrador</span>
      </header>

      <div class="stats">
        <div>Productos<strong>{products.length}</strong></div>
        <div>Categorías<strong>{categories.length}</strong></div>
        <div>
          Solicitudes pendientes
          <strong>{requests.filter(x => x.status === 'pendiente').length}</strong>
        </div>
        <div>Mensajes<strong>{messages.length}</strong></div>
      </div>

      {#if error}
        <p class="error">{error}</p>
      {/if}

      {#if notice}
        <p class="success">{notice}</p>
      {/if}

      {#if tab === 'products'}

        <section>
          <div class="heading">
            <h2>{editProduct ? 'Editar producto' : 'Agregar producto'}</h2>
            <button class="muted" onclick={resetP}>Limpiar</button>
          </div>

          <form onsubmit={saveP} class="form">
            <label>
              Nombre
              <input bind:value={p.name} required>
            </label>

            <label>
              Precio (DOP)
              <input type="number" min="0" step="0.01" bind:value={p.price} required>
            </label>

            <label>
              Stock
              <input type="number" min="0" step="1" bind:value={p.stock} required>
            </label>

            <label>
              Categoría
              <select bind:value={p.category_id}>
                <option value="">Sin categoría</option>
                {#each categories as x}
                  <option value={x.id}>{x.name}</option>
                {/each}
              </select>
            </label>

            <label class="wide">
              Descripción
              <textarea rows="3" bind:value={p.description}></textarea>
            </label>

            <label class="wide">
              URL de imagen
              <input type="url" bind:value={p.image_url} placeholder="https://...">
            </label>

            <label class="check">
              <input type="checkbox" bind:checked={p.is_active}>
              Visible en la tienda
            </label>

            <button disabled={busy}>
              {busy ? 'Guardando...' : editProduct ? 'Guardar cambios' : 'Agregar producto'}
            </button>
          </form>
        </section>

        <section>
          <div class="heading">
            <h2>Inventario</h2>
            <button class="muted" onclick={refresh}>Actualizar</button>
          </div>

          {#each products as x}
            <article class="line">
              <div>
                <b>{x.name}</b>
                <small>
                  {money(x.price)} · Stock: {x.stock} ·
                  {categories.find(z => z.id === x.category_id)?.name || 'Sin categoría'} ·
                  {x.is_active ? 'Visible' : 'Oculto'}
                </small>
              </div>

              <div class="actions">
                <button onclick={() => setP(x)}>Editar</button>
                <button class="danger" onclick={() => deleteP(x.id)}>Eliminar</button>
              </div>
            </article>
          {:else}
            <p>No hay productos todavía.</p>
          {/each}
        </section>

      {:else if tab === 'categories'}

        <section>
          <div class="heading">
            <h2>{editCategory ? 'Editar categoría' : 'Nueva categoría'}</h2>
            <button class="muted" onclick={resetC}>Limpiar</button>
          </div>

          <form onsubmit={saveC} class="form">
            <label>
              Nombre
              <input bind:value={c.name} required>
            </label>

            <label>
              Slug
              <input bind:value={c.slug} placeholder="Se genera automáticamente">
            </label>

            <label class="wide">
              Descripción
              <textarea rows="3" bind:value={c.description}></textarea>
            </label>

            <label class="wide">
              URL de imagen
              <input type="url" bind:value={c.image_url}>
            </label>

            <button disabled={busy}>
              {busy ? 'Guardando...' : editCategory ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </form>
        </section>

        <section>
          <h2>Categorías existentes</h2>

          {#each categories as x}
            <article class="line">
              <div>
                <b>{x.name}</b>
                <small>/{x.slug} · {products.filter(z => z.category_id === x.id).length} productos</small>
              </div>

              <div class="actions">
                <button onclick={() => setC(x)}>Editar</button>
                <button class="danger" onclick={() => deleteC(x.id)}>Eliminar</button>
              </div>
            </article>
          {:else}
            <p>No hay categorías.</p>
          {/each}
        </section>

      {:else if tab === 'requests'}

        <section>
          <div class="heading">
            <h2>Solicitudes de productos</h2>
            <button class="muted" onclick={refresh}>Actualizar</button>
          </div>

          {#each requests as x}
            <article class="card">
              <b>{x.product_name}</b>
              <p>{x.details || 'Sin detalles adicionales.'}</p>
              <small>{x.name} · {x.email} · {x.phone || ''}</small>

              <label>
                Estado
                <select value={x.status} onchange={e => setStatus(x.id, e.currentTarget.value)}>
                  <option value="pendiente">Pendiente</option>
                  <option value="revisando">Revisando</option>
                  <option value="respondida">Respondida</option>
                  <option value="cerrada">Cerrada</option>
                </select>
              </label>
            </article>
          {:else}
            <p>No hay solicitudes.</p>
          {/each}
        </section>

      {:else}

        <section>
          <div class="heading">
            <h2>Mensajes recibidos</h2>
            <button class="muted" onclick={refresh}>Actualizar</button>
          </div>

          {#each messages as x}
            <article class="card">
              <b>{x.subject || 'Sin asunto'}</b>
              <p>{x.message}</p>
              <small>
                {x.name} · {x.email} ·
                {new Date(x.created_at).toLocaleString('es-DO')}
              </small>
            </article>
          {:else}
            <p>No hay mensajes.</p>
          {/each}
        </section>

      {/if}
    </main>
  </div>

{:else}

  <main class="center">
    <h2>No se pudo verificar el acceso</h2>
    <p>{error || authState.error || 'No se encontró el perfil de administrador.'}</p>
    <a href="/login">Volver a iniciar sesión</a>
  </main>

{/if}

<style>
:global(body) {
  margin: 0;
  background: #f6f5f2;
  color: #242424;
  font-family: Arial, sans-serif;
}

.layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 235px 1fr;
}

aside {
  background: #202326;
  color: white;
  padding: 25px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.brand {
  font-size: 21px;
  color: white;
  text-decoration: none;
  font-weight: 900;
}

.brand b {
  color: #ed8745;
}

aside p,
header small {
  font-size: 11px;
  letter-spacing: 1.3px;
  color: #ed8745;
  font-weight: bold;
  margin-top: 30px;
}

aside button {
  background: transparent;
  border: 0;
  color: #ddd;
  text-align: left;
  padding: 12px;
  border-radius: 7px;
  cursor: pointer;
}

aside button.active,
aside button:hover {
  background: #393d40;
}

.bottom {
  margin-top: auto;
  display: grid;
  gap: 12px;
}

.bottom small {
  color: #bbb;
  overflow-wrap: anywhere;
}

.bottom a {
  color: #ed8745;
  font-size: 13px;
}

.main {
  max-width: 1300px;
  width: 100%;
  box-sizing: border-box;
  padding: 35px;
  margin: auto;
}

header,
.heading,
.line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

header h1 {
  margin: 7px 0 25px;
  font-size: 32px;
}

header span {
  background: #fff0e5;
  color: #b65a20;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stats div,
section {
  background: white;
  border: 1px solid #e9e6e1;
  border-radius: 12px;
  padding: 18px;
}

.stats strong {
  display: block;
  font-size: 25px;
  margin-top: 8px;
}

.main section {
  margin-top: 18px;
}

.main h2 {
  font-size: 20px;
  margin: 0 0 16px;
}

.form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px;
}

.form label,
.card label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  font-weight: bold;
}

.form input,
.form textarea,
.form select,
.card select {
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 7px;
  font: inherit;
}

.wide {
  grid-column: 1 / -1;
}

.check {
  display: flex !important;
  align-items: center;
}

.check input {
  width: auto;
}

.form button,
.card button,
.actions button,
.muted {
  border: 0;
  border-radius: 7px;
  padding: 10px 13px;
  cursor: pointer;
  background: #ed8745;
  color: white;
  font-weight: bold;
}

.muted,
.actions button {
  background: #eee;
  color: #333;
}

.actions .danger {
  background: #fff0ed;
  color: #a33;
}

.line {
  padding: 14px 0;
  border-bottom: 1px solid #eee;
}

.line small,
.card small {
  display: block;
  color: #777;
  margin-top: 6px;
}

.actions {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}

.card {
  border: 1px solid #eee;
  border-radius: 9px;
  padding: 15px;
  margin: 12px 0;
}

.card p {
  line-height: 1.5;
}

.card label {
  max-width: 230px;
  margin-top: 12px;
}

.error,
.success {
  padding: 12px;
  border-radius: 8px;
}

.error {
  background: #fff0ed;
  color: #a33;
}

.success {
  background: #eaf7ed;
  color: #276438;
}

.center {
  min-height: 65vh;
  display: grid;
  place-content: center;
  text-align: center;
  padding: 20px;
}

@media (max-width: 850px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .main {
    padding: 20px 14px;
  }

  .stats {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .form {
    grid-template-columns: 1fr;
  }

  .wide {
    grid-column: auto;
  }

  .line {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>