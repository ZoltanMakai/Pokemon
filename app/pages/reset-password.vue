<template>
  <div class="mx-auto max-w-md space-y-6">
    <div>
      <p class="text-sm font-medium uppercase tracking-widest text-primary">
        Account
      </p>
      <h1 class="mt-3 text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
        Choose a new password
      </h1>
      <p class="mt-2 text-sm leading-6 text-muted">
        Set a new password for your trainer account.
      </p>
    </div>

    <UCard :ui="{ body: 'p-6 sm:p-8' }">
      <div v-if="!recoveryReady && !linkInvalid" class="py-8 text-center text-sm text-muted">
        <UIcon name="i-lucide-loader-circle" class="mx-auto size-8 animate-spin text-primary" />
        <p class="mt-4">Verifying reset link…</p>
      </div>

      <template v-else-if="linkInvalid">
        <UAlert
          color="warning"
          variant="soft"
          title="This link is invalid or has expired"
          description="Request a new reset email and try again."
          class="w-full"
        />
        <div class="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <UButton to="/forgot-password" color="primary">
            Request new link
          </UButton>
          <UButton to="/login" variant="outline" color="neutral">
            Log in
          </UButton>
        </div>
      </template>

      <form v-else class="space-y-5" @submit.prevent="onSubmit">
        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          :title="errorMessage"
          class="w-full"
        />

        <UFormField label="New password" name="rp-pw">
          <PasswordInputToggle
            id="rp-pw"
            v-model="password"
            autocomplete="new-password"
            placeholder="At least 6 characters"
            input-class="w-full"
          />
        </UFormField>

        <UFormField label="Confirm new password" name="rp-pw2">
          <PasswordInputToggle
            id="rp-pw2"
            v-model="confirmPassword"
            autocomplete="new-password"
            placeholder="Repeat new password"
            input-class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          block
          :loading="submitting"
          :disabled="submitting"
        >
          {{ submitting ? "Updating…" : "Update password" }}
        </UButton>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();

const recoveryReady = ref(false);
const linkInvalid = ref(false);
const password = ref("");
const confirmPassword = ref("");
const submitting = ref(false);
const errorMessage = ref("");

let authSubscription: { unsubscribe: () => void } | null = null;
let failTimer: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  if (import.meta.client && sessionStorage.getItem("sb-recovery-pending") === "1") {
    sessionStorage.removeItem("sb-recovery-pending");
    recoveryReady.value = true;
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      recoveryReady.value = true;
      linkInvalid.value = false;
      if (failTimer !== undefined) {
        clearTimeout(failTimer);
        failTimer = undefined;
      }
    }
  });
  authSubscription = subscription;

  if (!recoveryReady.value) {
    failTimer = window.setTimeout(() => {
      if (!recoveryReady.value) {
        linkInvalid.value = true;
      }
    }, 8000);
  }
});

onUnmounted(() => {
  authSubscription?.unsubscribe();
  if (failTimer !== undefined) {
    clearTimeout(failTimer);
  }
});

async function onSubmit() {
  errorMessage.value = "";
  const p = password.value;
  const c = confirmPassword.value;

  if (p.length < 6) {
    errorMessage.value = "Password must be at least 6 characters long.";
    return;
  }
  if (p !== c) {
    errorMessage.value = "Passwords do not match.";
    return;
  }

  submitting.value = true;
  try {
    const { error } = await supabase.auth.updateUser({ password: p });
    if (error) {
      throw error;
    }
    await navigateTo("/");
  } catch (e) {
    errorMessage.value =
      e instanceof Error ? e.message : "Could not update password. Try again.";
  } finally {
    submitting.value = false;
  }
}
</script>
