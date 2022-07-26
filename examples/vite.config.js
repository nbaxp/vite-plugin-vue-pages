import path from 'path';
import Vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import ViteRestart from 'vite-plugin-restart';
import Inspect from 'vite-plugin-inspect';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import svgLoader from 'vite-svg-loader';
import vuePages from '../dist';

const pathSrc = path.resolve(__dirname, 'src');

export default defineConfig({
  build: {
    target: 'esnext',
    module: 'esm',
  },
  resolve: {
    alias: {
      '~/': `${pathSrc}/`,
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  plugins: [
    Vue(),
    ViteRestart({
      restart: [
        '../dist/index.js',
      ]
    }),
    Inspect(),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
      ],
      imports: ['vue', 'vue-router'],
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
    }),
    Components({
      resolvers: [
      ]
    }),
    svgLoader(),
    vuePages({ pageDir: 'src/views' })
  ],
});
