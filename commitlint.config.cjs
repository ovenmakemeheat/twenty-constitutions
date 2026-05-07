module.exports = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w+): (.+)$/,
      headerCorrespondence: ["type", "subject"],
    },
  },
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
    "scope-empty": [2, "always"],
    "body-empty": [2, "always"],
    "footer-empty": [2, "always"],
  },
}
