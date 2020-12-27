const defaultExtends = [
    //"eslint:recommended",
    "react-app",
    //"plugin:react/recommended",
    //"plugin:@typescript-eslint/recommended"
]

module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": defaultExtends,
    "ignorePatterns": [
        "build/**",
        "dist/**",
    ],
    "overrides": [
        {
            "files": ["cypress/**"],
            "extends": [
                ...defaultExtends,
                "plugin:cypress/recommended",
            ],
        },
        {
            "files": ["src/**/*.spec.*"],
            "extends": [
                ...defaultExtends,
                "react-app/jest",
            ],
        },
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "@typescript-eslint"
    ],
    "rules": {
    }
};
