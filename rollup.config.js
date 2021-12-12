import { nodeResolve } from "@rollup/plugin-node-resolve";

export default [
  {
    input: "node_modules/uvu/dist/index.mjs",
    output: {
      file: "test/uvu.js",
    },
    plugins: [nodeResolve()],
  },

  {
    input: "node_modules/uvu/assert/index.mjs",
    output: {
      file: "test/assert.js",
    },
    plugins: [nodeResolve()],
  },
];
