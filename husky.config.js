module.exports = {
    hooks: {
      'commit-msg': 'echo "$HUSKY_GIT_PARAMS" | grep -qE "^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?:\s.+"; if [ $? -ne 0 ]; then echo "Commit message must follow format: feat(loquesea): texto" && exit 1; fi'
    }
  }
  