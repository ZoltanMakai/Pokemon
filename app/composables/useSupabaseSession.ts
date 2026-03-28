import type { Session } from "@supabase/supabase-js";
import type { ProfilePublicRow } from "~/types/profile";

export function useSupabaseSession() {
  return useState<Session | null>("supabase-session", () => null);
}

export function useSupabaseAuthReady() {
  return useState<boolean>("supabase-auth-ready", () => false);
}

export function useAuthUser() {
  const session = useSupabaseSession();

  return computed(() => session.value?.user ?? null);
}

export function useResolvedAuthUser() {
  const authReady = useSupabaseAuthReady();
  const user = useAuthUser();
  const hydrated = ref(false);

  onMounted(() => {
    hydrated.value = true;
  });

  const authResolved = computed(() => hydrated.value && authReady.value);
  const resolvedUser = computed(() => (authResolved.value ? user.value : null));

  return {
    authResolved,
    user: resolvedUser,
  };
}

export function useUserNickname() {
  const user = useAuthUser();
  const publicProfile = useState<ProfilePublicRow | null>(
    "trainer-profile-public",
    () => null,
  );

  return computed(() => {
    const fromDb = publicProfile.value?.nickname?.trim();
    if (fromDb) {
      return fromDb;
    }

    const nickname = user.value?.user_metadata?.nickname;

    if (typeof nickname === "string" && nickname.trim()) {
      return nickname.trim();
    }

    return user.value?.email?.split("@")[0] ?? "";
  });
}
