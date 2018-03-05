module.exports = {
  extends: [
    "google",
    "plugin:react/recommended",
    "plugin:flowtype/recommended"
  ],
  parser: "babel-eslint",
  env: {
    browser: true
  },
  globals: {
    DOMRect: true,
    ReactDraggableCallbackData: true,
    defaultProps: true,
    bounding: true,
    container: true
  },
  plugins: [
    "react",
    "flowtype"
  ],
  rules: {
    "react/prop-types": 0,
    "no-implicit-coercion": 0,
    "max-len": 0
  }
};
