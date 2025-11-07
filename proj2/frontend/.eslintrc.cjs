module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  parserOptions: { ecmaVersion: 2021, sourceType: "module", ecmaFeatures: { jsx: true } },
  plugins: ["react", "react-hooks"],
  rules: {
    // allow React 17+ JSX without explicit React import
    "react/react-in-jsx-scope": "off",
    // enforce hooks rules
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  settings: { react: { version: "detect" } },
};
