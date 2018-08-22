// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential', 
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development 不允许debugger上线  在pc会有断点阻塞页面的运行
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 可以使用分号
    'semi': ['error', 'always'],
    'no-tabs': 0,
    // 换行
    'indent': 0,
    'space-before-function-paren': 0
  }
}
