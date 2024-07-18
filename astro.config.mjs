import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  markdown: {
    shikiConfig: {
      // Shiki에 내장된 테마 중에서 선택하거나 직접 추가하세요.
      // https://shiki.style/themes
      theme: 'github-dark',
      // 또는 여러 테마를 제공하세요.
      // https://shiki.style/guide/dual-themes#light-dark-dual-themes
      // themes: {
      //   light: 'github-light',
      //   dark: 'github-dark',
      // },
      // 맞춤 언어 추가
      // 참고: Shiki에는 .astro를 포함하여 수많은 언어가 내장되어 있습니다!
      // https://shiki.style/languages
      langs: [],
      // 가로 스크롤을 방지하려면 word wrap을 활성화하세요.
      wrap: true,
      // 맞춤 transformers 추가: https://shiki.style/guide/transformers
      // 일반 transformers 찾기: https://shiki.style/packages/transformers
      transformers: [],
    },
  },
});
