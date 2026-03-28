<template>
  <section class="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
    <UCard
      class="overflow-hidden border-default bg-linear-to-br from-neutral-950 via-primary-950 to-neutral-900 text-inverted shadow-xl dark:from-neutral-950 dark:via-primary-950 dark:to-neutral-950"
      :ui="{ body: 'p-8' }"
    >
      <template #header>
        <UBadge color="neutral" variant="subtle" class="border border-white/15 bg-white/10 text-inverted">
          Supabase authentication
        </UBadge>
      </template>

      <h1 class="mt-2 max-w-md text-3xl font-semibold tracking-tight sm:text-4xl">
        {{ heroTitle }}
      </h1>
      <p class="mt-4 max-w-lg text-sm leading-6 text-neutral-300">
        {{ heroDescription }}
      </p>

      <div class="mt-10 grid gap-4 sm:grid-cols-3">
        <UCard
          v-for="item in highlights"
          :key="item.label"
          class="border-white/10 bg-white/5 ring-0"
          :ui="{ body: 'p-4' }"
        >
          <p class="text-2xl">{{ item.icon }}</p>
          <p class="mt-4 text-sm font-medium text-white">{{ item.label }}</p>
          <p class="mt-1 text-xs leading-5 text-neutral-300">{{ item.description }}</p>
        </UCard>
      </div>
    </UCard>

    <UCard class="shadow-lg" :ui="{ body: 'p-6 sm:p-8' }">
      <template #header>
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-primary">{{ eyebrow }}</p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
              {{ title }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-muted">
              {{ description }}
            </p>
          </div>
          <UBadge color="success" variant="subtle">
            Live
          </UBadge>
        </div>
      </template>

      <form class="mt-6 space-y-5" @submit.prevent="onSubmit">
        <UAlert
          v-if="successMessage"
          color="success"
          variant="soft"
          :title="successMessage"
          class="w-full"
        />

        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          :title="errorMessage"
          class="w-full"
        />

        <template v-if="isRegister">
          <UFormField label="Public nickname" name="nickname" hint="3–24 characters. Shown as card creator name.">
            <UInput
              id="nickname"
              v-model="form.nickname"
              type="text"
              autocomplete="nickname"
              maxlength="24"
              placeholder="AshKetchum"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Avatar URL (optional)" name="avatar_url">
            <UInput
              id="avatar_url"
              v-model="form.avatar_url"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              class="w-full"
            />
            <div v-if="form.avatar_url.trim()" class="flex items-center gap-3 pt-2">
              <UAvatar
                :src="form.avatar_url.trim()"
                size="md"
                class="ring ring-default"
              />
            </div>
          </UFormField>

          <UFormField label="Short bio (optional)" name="bio" :hint="`${form.bio.length} / 500`">
            <UTextarea
              id="bio"
              v-model="form.bio"
              :rows="3"
              maxlength="500"
              autoresize
              placeholder="Favourite type, region, or a one-liner…"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Full name (optional)" name="full_name">
            <UInput
              id="full_name"
              v-model="form.full_name"
              type="text"
              autocomplete="name"
              maxlength="120"
              placeholder="Your name"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Phone (optional)" name="phone">
            <UInput
              id="phone"
              v-model="form.phone"
              type="tel"
              autocomplete="tel"
              maxlength="40"
              placeholder="+36 …"
              class="w-full"
            />
          </UFormField>
        </template>

        <UFormField label="Email address" name="email">
          <UInput
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="trainer@example.com"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Password" name="password">
          <PasswordInputToggle
            id="password"
            v-model="form.password"
            :autocomplete="isRegister ? 'new-password' : 'current-password'"
            :placeholder="passwordPlaceholder"
            input-class="w-full"
          />
          <div v-if="isRegister && form.password" class="mt-2 space-y-1">
            <UProgress
              :model-value="passwordStrengthPercent"
              :max="100"
              size="xs"
              :color="passwordStrengthProgressColor"
            />
            <p class="text-xs text-muted">
              Password strength:
              <span class="font-medium text-default">{{ passwordStrengthLabel }}</span>
            </p>
          </div>
        </UFormField>

        <UFormField
          v-if="isRegister"
          label="Confirm password"
          name="confirmPassword"
        >
          <PasswordInputToggle
            id="confirmPassword"
            v-model="form.confirmPassword"
            autocomplete="new-password"
            placeholder="Repeat your password"
            input-class="w-full"
          />
        </UFormField>

        <UAlert color="neutral" variant="outline" :description="helperText" class="w-full" />

        <UButton
          type="submit"
          color="primary"
          block
          :loading="loading"
          :disabled="loading"
        >
          {{ loading ? loadingLabel : submitLabel }}
        </UButton>
      </form>

      <template #footer>
        <div class="space-y-2 text-center text-sm text-muted">
          <p v-if="!isRegister">
            <UButton
              variant="link"
              color="primary"
              to="/forgot-password"
              class="p-0 align-baseline"
            >
              Forgot password?
            </UButton>
          </p>
          <p>
            {{ alternatePrompt }}
            <UButton
              variant="link"
              color="primary"
              :to="alternateLink"
              class="p-0 align-baseline"
            >
              {{ alternateLabel }}
            </UButton>
          </p>
        </div>
      </template>
    </UCard>
  </section>
</template>

<script setup lang="ts">
type AuthMode = "login" | "register";

const props = defineProps<{
  mode: AuthMode;
}>();

const router = useRouter();
const supabase = useSupabaseClient();
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const isRegister = computed(() => props.mode === "register");

const form = reactive({
  nickname: "",
  avatar_url: "",
  bio: "",
  full_name: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const passwordStrengthScore = computed(() => {
  const p = form.password;
  if (!p) {
    return 0;
  }
  let s = 0;
  if (p.length >= 8) {
    s += 1;
  }
  if (p.length >= 12) {
    s += 1;
  }
  if (/[0-9]/.test(p)) {
    s += 1;
  }
  if (/[^a-zA-Z0-9]/.test(p)) {
    s += 1;
  }
  return Math.min(s, 4);
});

const passwordStrengthPercent = computed(() => passwordStrengthScore.value * 25);

const passwordStrengthLabel = computed(() => {
  const labels = ["Too weak", "Weak", "OK", "Good", "Strong"];
  return labels[passwordStrengthScore.value];
});

const passwordStrengthProgressColor = computed(() => {
  const c = passwordStrengthScore.value;
  if (c <= 1) {
    return "error";
  }
  if (c === 2) {
    return "warning";
  }
  if (c === 3) {
    return "info";
  }
  return "success";
});

const content = computed(() => {
  if (props.mode === "register") {
    return {
      eyebrow: "Create account",
      title: "Create your trainer account.",
      description: "Choose how you show up on cards and add optional contact details.",
      heroTitle: "Trainer onboarding.",
      heroDescription:
        "Set your nickname, optional avatar and bio, then start collecting and sharing cards.",
      submitLabel: "Create account",
      loadingLabel: "Creating account...",
      helperText: "You can update your profile anytime after you sign in.",
      alternatePrompt: "Already have an account?",
      alternateLabel: "Log in",
      alternateLink: "/login",
      passwordPlaceholder: "At least 8 characters recommended",
      highlights: [
        { icon: "🎴", label: "Your cards", description: "Your nickname and avatar appear on cards you create." },
        { icon: "✏️", label: "Your profile", description: "Adjust details whenever you like from your profile page." },
        { icon: "✓", label: "Secure saves", description: "Saving changes asks for your password to confirm it’s you." },
      ],
    };
  }

  return {
    eyebrow: "Welcome back",
    title: "Log in to manage your own cards.",
    description: "Sign in to create cards, edit your own entries, and remove only the cards you own.",
    heroTitle: "Keep your cards, favorites, and profile in one place.",
    heroDescription:
      "Anyone can browse the collection, but logging in unlocks card creation and owner-only controls for your trainer account.",
    submitLabel: "Log in",
    loadingLabel: "Signing in...",
    helperText: "Use the same email and password you registered with in Supabase Auth.",
    alternatePrompt: "New here?",
    alternateLabel: "Create an account",
    alternateLink: "/register",
    passwordPlaceholder: "Enter your password",
    highlights: [
      { icon: "01", label: "Owner Controls", description: "Edit and delete buttons appear only on your cards." },
      { icon: "02", label: "Shared Viewing", description: "Visitors can still browse every published card." },
      { icon: "03", label: "Fast Access", description: "Your session is restored automatically in the browser." },
    ],
  };
});

const eyebrow = computed(() => content.value.eyebrow);
const title = computed(() => content.value.title);
const description = computed(() => content.value.description);
const heroTitle = computed(() => content.value.heroTitle);
const heroDescription = computed(() => content.value.heroDescription);
const submitLabel = computed(() => content.value.submitLabel);
const loadingLabel = computed(() => content.value.loadingLabel);
const helperText = computed(() => content.value.helperText);
const alternatePrompt = computed(() => content.value.alternatePrompt);
const alternateLabel = computed(() => content.value.alternateLabel);
const alternateLink = computed(() => content.value.alternateLink);
const passwordPlaceholder = computed(() => content.value.passwordPlaceholder);
const highlights = computed(() => content.value.highlights);

async function onSubmit() {
  errorMessage.value = "";
  successMessage.value = "";
  loading.value = true;

  try {
    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      throw new Error("Please fill in your email and password.");
    }

    if (isRegister.value) {
      const nickname = form.nickname.trim();
      const avatar_url = form.avatar_url.trim().slice(0, 2000);
      const bio = form.bio.trim().slice(0, 500);
      const full_name = form.full_name.trim().slice(0, 120);
      const phone = form.phone.trim().slice(0, 40);

      if (nickname.length < 3) {
        throw new Error("Nickname must be at least 3 characters long.");
      }

      if (nickname.length > 24) {
        throw new Error("Nickname must be at most 24 characters.");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      if (password !== form.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname,
            avatar_url,
            bio,
            full_name,
            phone,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        successMessage.value = "Account created. You are now signed in.";
        await router.push("/");
      } else {
        successMessage.value =
          "Account created. Check your email if confirmation is required, then sign in.";
      }

      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    await router.push("/");
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Authentication failed. Please try again.";
    await nextTick();
    if (import.meta.client) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  } finally {
    loading.value = false;
  }
}
</script>
