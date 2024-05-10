# Actions Usage Action

Get your GitHub Actions usage in minutes for either a repository or a specific workflow.

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
name: Actions Usage
on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: austenstone/actions-usage@main
        id: usage
      - run: echo "Total usage: ${{ steps.usage.outputs.total }}"
      - if: ${{ steps.usage.outputs.total > 50000 }}
        run: echo "Actions Usage is over 50,000 minutes!"
```

#### Example Notification Actions

Use this action in combination with other actions to notify users.

- [send-email](https://github.com/marketplace/actions/send-email)
- [slack-send](https://github.com/marketplace/actions/slack-send)
- [jira-create-issue](https://github.com/marketplace/actions/jira-create-issue)

#### Example Notification Workflow
```yml
name: Actions Usage
on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: austenstone/actions-usage@main
        id: usage
      - name: Post to a Slack channel
        if: ${{ steps.usage.outputs.total > 50000 }}
        id: slack
        uses: slackapi/slack-github-action@v1.26.0
        with:
          # Slack channel id, channel name, or user id to post message.
          # See also: https://api.slack.com/methods/chat.postMessage#channels
          # You can pass in multiple channels to post to by providing a comma-delimited list of channel IDs.
          channel-id: 'CHANNEL_ID,ANOTHER_CHANNEL_ID'
          # For posting a simple plain text message
          slack-message: "Your GitHub Actions usage is over 50,000 minutes!"
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

## ➡️ Inputs
Various inputs are defined in [`action.yml`](action.yml):

| Name | Description | Default |
| --- | - | - |
| github&#x2011;token | Token to use to authorize. | ${{&nbsp;github.token&nbsp;}} |
| workflow | The workflow file name or id. | main.yml |

## ⬅️ Outputs
| Name | Description |
| --- | - |
| ubuntu | The usage in minutes for Ubuntu |
| macos | The usage in minutes for macOS |
| windows | The usage in minutes for Windows |
| total | The total usage in minutes |


## Further help
To get more help on the Actions see [documentation](https://docs.github.com/en/actions).
