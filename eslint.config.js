export default [
    {
        files: ["**/*.js"],
        ignores: ["dist/**", "node_modules/**"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                browser: true,
                document: true,
                window: true,
                console: true,
            },
        },
    },
];
