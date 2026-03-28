let authListenerRegistered = false;

export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient();
  const session = useSupabaseSession();
  const authReady = useSupabaseAuthReady();

  if (!authReady.value) {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    session.value = currentSession;
    authReady.value = true;
  }

  if (!authListenerRegistered) {
    supabase.auth.onAuthStateChange((event, nextSession) => {
      session.value = nextSession;
      authReady.value = true;
      if (event === "PASSWORD_RECOVERY" && import.meta.client) {
        sessionStorage.setItem("sb-recovery-pending", "1");
      }
    });

    authListenerRegistered = true;
  }
});
