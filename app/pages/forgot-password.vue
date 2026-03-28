<template>
  <div class="mx-auto max-w-md space-y-6">
    <div>
      <p class="text-sm font-medium uppercase tracking-widest text-primary">
        Account
      </p>
      <h1
        class="mt-3 text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
        Reset your password
      </h1>
      <p class="mt-2 text-sm leading-6 text-muted">
        Enter the email you used to register. If an account exists, we will send
        a link to set a new password.
      </p>
    </div>

    <UCard :ui="{ body: 'p-6 sm:p-8' }">
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :title="errorMessage"
        class="mb-5 w-full" />

      <UAlert
        v-if="sent"
        color="success"
        variant="soft"
        title="Check your email"
        description="If an account exists for that address, we sent a reset link. Open it to choose a new password."
        class="mb-5 w-full" />

      <form v-if="!sent" class="space-y-5" @submit.prevent="onSubmit">
        <UFormField label="Email address" name="fp-email">
          <UInput
            id="fp-email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="trainer@example.com"
            class="w-full" />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          block
          :loading="loading"
          :disabled="loading">
          {{ loading ? "Sending…" : "Send reset link" }}
        </UButton>
      </form>

      <p class="mt-6 text-center text-sm text-muted">
        <UButton variant="link" color="primary" to="/login" class="p-0">
          Back to log in
        </UButton>
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const config = useRuntimeConfig();

const email = ref("");
const loading = ref(false);
const sent = ref(false);
const errorMessage = ref("");

function formatResetEmailError(e: unknown): string {
  const raw =
    e && typeof e === "object" && "message" in e
      ? String((e as { message: string }).message)
      : "";
  const code =
    e && typeof e === "object" && "code" in e
      ? String((e as { code?: string }).code ?? "")
      : "";
  const status =
    e && typeof e === "object" && "status" in e
      ? Number((e as { status?: number }).status)
      : NaN;

  const looksRateLimited =
    status === 429 ||
    /rate\s*limit|too\s+many\s+requests|email\s+rate/i.test(raw) ||
    code === "over_email_send_rate_limit";

  if (looksRateLimited) {
    return "Too many password reset emails were requested. Please wait a while and try again later.";
  }

  if (raw) {
    return raw;
  }
  return "Something went wrong. Please try again.";
}

function resetPasswordRedirectUrl(): string {
  const configured =
    (config.public.siteUrl as string | undefined)?.replace(/\/$/, "") ?? "";
  const origin =
    configured || (import.meta.client ? window.location.origin : "");
  return `${origin}/reset-password`;
}

async function onSubmit() {
  errorMessage.value = "";
  const trimmed = email.value.trim();
  if (!trimmed) {
    errorMessage.value = "Please enter your email.";
    return;
  }

  loading.value = true;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: resetPasswordRedirectUrl(),
    });
    if (error) {
      throw error;
    }
    sent.value = true;
  } catch (e) {
    errorMessage.value = formatResetEmailError(e);
  } finally {
    loading.value = false;
  }
}
</script>
