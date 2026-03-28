import type { ProfilePrivateRow, ProfilePublicRow } from "~/types/profile";

export function useTrainerProfile() {
  const supabase = useSupabaseClient();
  const user = useAuthUser();

  const publicProfile = useState<ProfilePublicRow | null>(
    "trainer-profile-public",
    () => null,
  );
  const privateProfile = useState<ProfilePrivateRow | null>(
    "trainer-profile-private",
    () => null,
  );
  const loading = useState<boolean>("trainer-profile-loading", () => false);
  const error = useState<string | null>("trainer-profile-error", () => null);

  async function loadTrainerProfile() {
    error.value = null;

    if (!user.value) {
      publicProfile.value = null;
      privateProfile.value = null;
      return;
    }

    loading.value = true;

    const uid = user.value.id;

    const [pubRes, privRes] = await Promise.all([
      supabase.from("profiles_public").select("*").eq("id", uid).maybeSingle(),
      supabase.from("profiles_private").select("*").eq("id", uid).maybeSingle(),
    ]);

    if (pubRes.error) {
      error.value = pubRes.error.message;
    } else {
      publicProfile.value = (pubRes.data as ProfilePublicRow) ?? null;
    }

    if (privRes.error) {
      error.value = privRes.error.message;
    } else {
      privateProfile.value = (privRes.data as ProfilePrivateRow) ?? null;
    }

    loading.value = false;
  }

  watch(
    () => user.value?.id,
    () => {
      void loadTrainerProfile();
    },
    { immediate: true },
  );

  return {
    publicProfile,
    privateProfile,
    loading,
    error,
    loadTrainerProfile,
  };
}
