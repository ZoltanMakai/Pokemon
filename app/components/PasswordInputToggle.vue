<template>
  <UInput
    :id="id"
    v-model="model"
    :type="visible ? 'text' : 'password'"
    :autocomplete="autocomplete"
    :placeholder="placeholder"
    :class="inputClass"
  >
    <template #trailing>
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        size="xs"
        square
        class="shrink-0"
        :aria-pressed="visible"
        :aria-label="visible ? 'Hide password' : 'Show password'"
        :icon="visible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        @click.prevent="visible = !visible"
      />
    </template>
  </UInput>
</template>

<script setup lang="ts">
defineProps<{
  id?: string;
  autocomplete?: string;
  placeholder?: string;
  inputClass?: string;
}>();

const model = defineModel<string>({ default: "" });
const visible = ref(false);
</script>
