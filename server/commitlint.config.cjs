module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'body-max-line-length': [1, 'always', 100],
    'type-enum': [
      2,
      'always',
      [
        'feat', // new feature
        'fix', // bug fix
        'docs', // documentation only
        'style', // formatting, no code change
        'refactor', // code change that neither fixes a bug nor adds a feature
        'perf', // performance improvement
        'test', // adding or updating tests
        'build', // build system, deps
        'ci', // CI config
        'chore', // misc maintenance
        'revert', // revert a commit
      ],
    ],
  },
};
