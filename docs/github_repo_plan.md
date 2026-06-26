# GitHub Repo Plan

Target repository:

```text
github.com/cemphlvn/graphite
```

## Current State

This directory is repo-shaped but not yet a real GitHub submodule.

Reason:

```text
a real submodule needs a real remote repository and pinned commit
```

## Promotion Steps

1. create GitHub repo `cemphlvn/graphite`,
2. move or push this directory as the initial repo,
3. tag pre-release `v0.0.0-incubating`,
4. replace this local directory with a real git submodule:

```sh
git submodule add https://github.com/cemphlvn/graphite.git graphite
git submodule update --init --recursive
```

5. keep foundation integration as an incubation pointer until Graphite `1.0`.

