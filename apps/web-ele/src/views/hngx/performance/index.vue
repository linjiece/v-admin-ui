<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
// const url = computed(() => (route.query.url as string) || '');
const url = { url: 'http://10.109.205.239:5005/' };

const safeUrl = computed(() => {
  try {
    const u = new URL(url.value);
    return u.toString();
  } catch {
    return url.value;
  }
});
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100%">
    <div v-if="!url" style="padding: 16px; color: #888">
      未提供 url，请在路由查询参数中传入 `url`
    </div>
    <iframe
      v-else
      :src="safeUrl"
      frameborder="0"
      style="flex: 1; width: 100%; height: 100%"
      sandbox="allow-scripts allow-forms allow-popups"
    ></iframe>
  </div>
</template>
