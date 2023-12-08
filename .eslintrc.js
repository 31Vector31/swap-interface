/* eslint-env node */

const { node: restrictedImports } = require('@uniswap/eslint-config/restrictedImports')
require('@uniswap/eslint-config/load')

const rulesDirPlugin = require('eslint-plugin-rulesdir')
rulesDirPlugin.RULES_DIR = 'eslint_rules'

module.exports = {
  rules: {
    "padded-blocks": "off",
  },
};
