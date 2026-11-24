import { supabase } from '#lib/supabase';

export const authState = $state({
  user: null,
  profile: null,
  loading: true,
  error: '',
});

let initializationPromise = null;
let authSubscription = null;

function timeout(promise, message, ms = 10000) {
  let timer;

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

export async function loadUser(user) {
  authState.user = user || null;
  authState.profile = null;
  authState.error = '';

  if (!user) {
    authState.loading = false;
    return null;
  }

  try {
    const { data, error } = await timeout(
      supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', user.id)
        .maybeSingle(),
      'No se pudo consultar el perfil. Comprueba la conexión con Supabase.'
    );

    if (error) throw error;

    if (!data) {
      throw new Error(
        'No existe un perfil para esta cuenta en la tabla profiles.'
      );
    }

    if (data.role !== 'admin' && data.role !== 'user') {
      throw new Error('El rol de esta cuenta no es válido.');
    }

    authState.profile = data;
    return data;
  } catch (e) {
    authState.error = e.message || 'Error al cargar el perfil.';
    console.error('ERROR PROFILE:', e);
    return null;
  } finally {
    authState.loading = false;
  }
}

export function initializeAuth() {
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    authState.loading = true;
    authState.error = '';

    try {
      const { data, error } = await timeout(
        supabase.auth.getSession(),
        'No se pudo comprobar la sesión. Revisa Supabase.'
      );

      if (error) throw error;

      await loadUser(data.session?.user || null);

      if (!authSubscription) {
        const { data: listener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === 'INITIAL_SESSION') return;

            Promise.resolve().then(() => {
              loadUser(session?.user || null);
            });
          }
        );

        authSubscription = listener.subscription;
      }
    } catch (e) {
      authState.error = e.message || 'Error de autenticación.';
      authState.loading = false;
      console.error('AUTH ERROR:', e);
    }

    return authState;
  })();

  return initializationPromise;
}

export async function loginUser(email, password) {
  authState.loading = true;
  authState.error = '';

  try {
    const { data, error } = await timeout(
      supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      }),
      'La conexión con Supabase tardó demasiado.'
    );

    if (error) throw error;

    const profile = await loadUser(data.user);

    if (!profile) {
      throw new Error(authState.error || 'No se pudo cargar tu perfil.');
    }

    return {
      error: null,
      user: data.user,
      profile,
    };
  } catch (e) {
    authState.loading = false;
    authState.error = e.message;
    return { error: e };
  }
}

export async function registerUser(fullName, email, password) {
  try {
    const { data, error } = await timeout(
      supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      }),
      'No se pudo registrar la cuenta.'
    );

    if (error) throw error;

    if (data.session && data.user) {
      await loadUser(data.user);
    }

    return {
      error: null,
      confirmationRequired: !data.session,
    };
  } catch (e) {
    return { error: e };
  }
}

export async function logoutUser() {
  try {
    const { error } = await timeout(
      supabase.auth.signOut(),
      'No se pudo cerrar la sesión.'
    );

    if (error) throw error;

    authState.user = null;
    authState.profile = null;
    authState.error = '';
    authState.loading = false;

    initializationPromise = null;

    return { error: null };
  } catch (e) {
    return { error: e };
  }
}
