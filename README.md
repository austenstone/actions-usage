# Action

This repository serves as a [template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) for TypeScript [Actions](https://docs.github.com/en/actions).

## Usage
Create a workflow (eg: `.github/workflows/seat-count.yml`). See [Creating a Workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

#### Token

Anyone with read access to the repository can use this endpoint.

Personal access tokens (classic) need the `repo` scope to use this endpoint with a private repository.

##### Fine-grained access tokens for "Get workflow usage"

This endpoint works with the following token types:

* GitHub App user access tokens
* GitHub App installation access tokens
* Fine-grained personal access tokens

The token must have the following permission set:

* `actions:read`

This endpoint can be used without authentication or the aforementioned permissions if only public resources are requested.

#### Example
```yml
name: TypeScript Action Workflow
on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  run:
    name: Run Action
    runs-on: ubuntu-latest
    steps:
      - uses: austenstone/actions-usage@main
        id: usage
```

## ➡️ Inputs
Various inputs are defined in [`action.yml`](action.yml):

| Name | Description | Default |
| --- | - | - |
| github&#x2011;token | Token to use to authorize. | ${{&nbsp;github.token&nbsp;}} |
| workflow | The workflow file name or id. | `main.yml` |

## ⬅️ Outputs
| Name | Description |
| --- | - |
| ubuntu | The usage in minutes for Ubuntu |
| macos | The usage in minutes for macOS |
| windows | The usage in minutes for Windows |
| total | The total usage in minutes |


## Further help
To get more help on the Actions see [documentation](https://docs.github.com/en/actions).
