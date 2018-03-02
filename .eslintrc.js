module.exports = {
  extends: [
    "google",
    "plugin:react/recommended",
    "plugin:flowtype/recommended"
  ],
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 7,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true
  },
  globals: {
    DOMRect: true
  },
  plugins: [
    "react",
    "flowtype"
  ],
  rules: {
    "react/prop-types": 0
  }
};
