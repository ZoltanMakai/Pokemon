<template>
  <div class="space-y-8">
    <div class="max-w-2xl">
      <p class="text-sm font-medium uppercase tracking-widest text-primary">
        Your profile
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight text-highlighted">
        Edit trainer profile
      </h1>
    </div>

    <UCard v-if="!authResolved" :ui="{ body: 'p-10 text-center' }">
      <USkeleton class="mx-auto h-4 w-48" />
      <p class="mt-4 text-sm text-muted">Checking session…</p>
    </UCard>

    <UAlert
      v-else-if="!user"
      color="warning"
      variant="soft"
      title="You need to sign in to edit your profile."
      class="w-full max-w-2xl"
    >
      <template #description>
        <UButton to="/login" color="primary" variant="link" class="mt-2 p-0">
          Go to log in
        </UButton>
      </template>
    </UAlert>

    <form
      v-else
      class="space-y-10"
      @submit.prevent="onSave"
    >
      <UAlert
        v-if="saveError"
        color="error"
        variant="soft"
        :title="saveError"
        class="w-full"
      />

      <UCard :ui="{ body: 'p-6 sm:p-8' }">
        <template #header>
          <h2 class="text-lg font-semibold text-highlighted">Trainer appearance</h2>
          <p class="mt-2 text-sm text-muted">
            Nickname, avatar, and bio show on cards you create.
          </p>
        </template>

        <div class="mt-2 grid gap-5 sm:grid-cols-2">
          <UFormField label="Nickname" name="pf-nickname" class="sm:col-span-2">
            <UInput
              id="pf-nickname"
              v-model="formPublic.nickname"
              type="text"
              maxlength="24"
              autocomplete="nickname"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Avatar image URL" name="pf-avatar" class="sm:col-span-2">
            <UInput
              id="pf-avatar"
              v-model="formPublic.avatar_url"
              type="url"
              placeholder="https://…"
              class="w-full"
            />
            <div
              v-if="formPublic.avatar_url.trim()"
              class="mt-2 flex items-center gap-3"
            >
              <UAvatar
                :src="formPublic.avatar_url.trim()"
                alt="Preview"
                size="lg"
                class="ring ring-default"
                loading="lazy"
                @error="avatarPreviewError = true"
                @load="avatarPreviewError = false"
              />
              <p v-if="avatarPreviewError" class="text-xs text-warning">
                Could not load image (check URL).
              </p>
            </div>
          </UFormField>

          <UFormField
            label="Bio"
            name="pf-bio"
            class="sm:col-span-2"
            :hint="`${formPublic.bio.length} / 500`"
          >
            <UTextarea
              id="pf-bio"
              v-model="formPublic.bio"
              :rows="4"
              maxlength="500"
              autoresize
              class="w-full"
            />
          </UFormField>
        </div>
      </UCard>

      <UCard
        class="bg-elevated/50"
        :ui="{ body: 'p-6 sm:p-8' }"
      >
        <template #header>
          <h2 class="text-lg font-semibold text-highlighted">Contact</h2>
          <p class="mt-2 text-sm text-muted">
            Name and phone for your records; not shown on shared cards.
          </p>
        </template>

        <div class="mt-2 grid gap-5 sm:grid-cols-2">
          <UFormField label="Email" name="pv-email" class="sm:col-span-2">
            <UInput
              id="pv-email"
              :model-value="displayEmail"
              type="email"
              autocomplete="email"
              readonly
              disabled
              class="w-full"
            />
          </UFormField>

          <UFormField label="Full name" name="pv-name">
            <UInput
              id="pv-name"
              v-model="formPrivate.full_name"
              type="text"
              maxlength="120"
              autocomplete="name"
              class="w-full"
            />
          </UFormField>
          <UFormField label="Phone" name="pv-phone">
            <UInput
              id="pv-phone"
              v-model="formPrivate.phone"
              type="tel"
              maxlength="40"
              autocomplete="tel"
              class="w-full"
            />
          </UFormField>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-6 sm:p-8' }">
        <template #header>
          <h2 class="text-lg font-semibold text-highlighted">Change password</h2>
          <p class="mt-2 text-sm text-muted">
            Optional. Leave both fields empty to keep your current password.
          </p>
        </template>

        <div class="mt-2 grid gap-5 sm:grid-cols-2">
          <UFormField label="New password" name="pf-new-pw" class="sm:col-span-2">
            <PasswordInputToggle
              id="pf-new-pw"
              v-model="newPassword"
              autocomplete="new-password"
              input-class="w-full"
            />
          </UFormField>
          <UFormField label="Confirm new password" name="pf-new-pw2" class="sm:col-span-2">
            <PasswordInputToggle
              id="pf-new-pw2"
              v-model="confirmNewPassword"
              autocomplete="new-password"
              input-class="w-full"
            />
          </UFormField>
        </div>
      </UCard>

      <UCard
        class="border-primary/30 bg-primary/5"
        :ui="{ body: 'p-6 sm:p-8' }"
      >
        <template #header>
          <h2 class="text-lg font-semibold text-highlighted">Confirm with password</h2>
          <p class="mt-2 text-sm text-muted">
            Enter your current password to save profile and password changes.
          </p>
        </template>

        <UFormField label="Current password" name="pf-pw" class="mt-2">
          <PasswordInputToggle
            id="pf-pw"
            v-model="confirmPassword"
            autocomplete="current-password"
            input-class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          class="mt-6 w-full sm:w-auto sm:min-w-[200px]"
          :loading="saving"
          :disabled="saving"
        >
          {{ saving ? "Saving…" : "Save changes" }}
        </UButton>
      </UCard>
    </form>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const { authResolved, user } = useResolvedAuthUser();
const { publicProfile, privateProfile, loadTrainerProfile } = useTrainerProfile();
const { refreshCards } = useCards();

const formPublic = reactive({
  nickname: "",
  avatar_url: "",
  bio: "",
});

const formPrivate = reactive({
  full_name: "",
  phone: "",
});

const confirmPassword = ref("");
const newPassword = ref("");
const confirmNewPassword = ref("");
const saving = ref(false);
const saveError = ref("");
const avatarPreviewError = ref(false);

function scrollPageToTop() {
  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

const displayEmail = computed(() => {
  const fromSession = user.value?.email?.trim();
  if (fromSession) {
    return fromSession;
  }
  return privateProfile.value?.email?.trim() ?? "";
});

watch(
  publicProfile,
  (row) => {
    if (!row) {
      return;
    }
    formPublic.nickname = row.nickname ?? "";
    formPublic.avatar_url = row.avatar_url ?? "";
    formPublic.bio = row.bio ?? "";
  },
  { immediate: true },
);

watch(
  privateProfile,
  (row) => {
    if (!row) {
      return;
    }
    formPrivate.full_name = row.full_name ?? "";
    formPrivate.phone = row.phone ?? "";
  },
  { immediate: true },
);

function validatePublic() {
  const nick = formPublic.nickname.trim();
  if (nick.length < 3 || nick.length > 24) {
    throw new Error("Nickname must be between 3 and 24 characters.");
  }
  if (formPublic.avatar_url.length > 2000) {
    throw new Error("Avatar URL is too long (max 2000 characters).");
  }
  if (formPublic.bio.length > 500) {
    throw new Error("Bio is too long (max 500 characters).");
  }
}

function validateNewPassword() {
  const next = newPassword.value;
  const again = confirmNewPassword.value;
  const hasNext = next.length > 0;
  const hasAgain = again.length > 0;
  if (!hasNext && !hasAgain) {
    return;
  }
  if (hasNext !== hasAgain) {
    throw new Error("Fill in both new password fields, or leave both empty.");
  }
  if (next.length < 6) {
    throw new Error("New password must be at least 6 characters long.");
  }
  if (next !== again) {
    throw new Error("New passwords do not match.");
  }
}

async function onSave() {
  saveError.value = "";

  if (!user.value?.email) {
    saveError.value = "No email on session.";
    scrollPageToTop();
    return;
  }

  const pw = confirmPassword.value;
  if (!pw) {
    saveError.value = "Enter your current password to save changes.";
    scrollPageToTop();
    return;
  }

  try {
    validatePublic();
    validateNewPassword();
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : "Validation failed.";
    scrollPageToTop();
    return;
  }

  saving.value = true;

  try {
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: user.value.email,
      password: pw,
    });

    if (authErr) {
      throw new Error("Incorrect password. Try again.");
    }

    const uid = user.value.id;

    const { error: pubErr } = await supabase.from("profiles_public").upsert(
      {
        id: uid,
        nickname: formPublic.nickname.trim(),
        avatar_url: formPublic.avatar_url.trim(),
        bio: formPublic.bio.trim(),
      },
      { onConflict: "id" },
    );

    if (pubErr) {
      throw new Error(pubErr.message);
    }

    const { error: privErr } = await supabase.from("profiles_private").upsert(
      {
        id: uid,
        full_name: formPrivate.full_name.trim(),
        phone: formPrivate.phone.trim(),
      },
      { onConflict: "id" },
    );

    if (privErr) {
      throw new Error(privErr.message);
    }

    const nextPw = newPassword.value;
    if (nextPw.length > 0) {
      const { error: pwErr } = await supabase.auth.updateUser({
        password: nextPw,
      });
      if (pwErr) {
        throw new Error(pwErr.message);
      }
    }

    confirmPassword.value = "";
    newPassword.value = "";
    confirmNewPassword.value = "";
    await loadTrainerProfile();
    await refreshCards();
    await navigateTo("/");
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : "Save failed.";
    await nextTick();
    scrollPageToTop();
  } finally {
    saving.value = false;
  }
}
</script>
