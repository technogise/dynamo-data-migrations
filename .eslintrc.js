module.exports = {
    root: true,
    plugins: ['@typescript-eslint', 'jest', 'promise', 'unicorn'],
    extends: [
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:jest/recommended',
        'plugin:promise/recommended',
        'plugin:unicorn/recommended',
        'prettier',
        'prettier/react',
        'prettier/@typescript-eslint',
    ],
    parserOptions: {
        project: 'tsconfig.json',
    },
    env: {
        node: true,
        jest: true,
    },
    rules: {
        'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
        'no-prototype-builtins': 'off',
        'import/prefer-default-export': 'off',
        'import/no-default-export': 'error',
        'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
        "class-methods-use-this": ['error', { "exceptMethods": ["loadMigrationFile"] }],
        '@typescript-eslint/no-use-before-define': [
            'error',
            { functions: false, classes: true, variables: true, typedefs: true },
        ],
        // Common abbreviations are known and readable
        'unicorn/prevent-abbreviations': 'off',
        'unicorn/no-useless-undefined': 'off',
        'unicorn/no-null': 'off',
        'unicorn/prefer-node-protocol': 'off',
        'unicorn/filename-case': ['error', { case: 'camelCase' }],
        // Allow devDependencies in tests
        'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.spec.ts', 'tests/*'] }],
        'unicorn/prefer-module': 'off',
        "import/extensions": [
            0,
            ".mjs"
          ]
    },
};
