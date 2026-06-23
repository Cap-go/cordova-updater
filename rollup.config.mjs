export default {
  input: 'dist/esm/plugin.js',
  output: [
    {
      file: 'dist/plugin.js',
      format: 'iife',
      name: 'capgoCordovaUpdaterBootstrap',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/plugin.cjs.js',
      format: 'cjs',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
};
