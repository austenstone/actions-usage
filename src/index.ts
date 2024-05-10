import { getInput, info, error, setOutput } from "@actions/core";
import { getOctokit, context } from "@actions/github";
import { RestEndpointMethodTypes } from "@actions/github/node_modules/@octokit/plugin-rest-endpoint-methods";

interface Input {
  token: string;
  workflows: string;
}

const getInputs = (): Input => {
  const result = {} as Input;
  result.token = getInput("github-token");
  result.workflows = getInput("workflows");
  if (!result.token || result.token === "") {
    throw new Error("github-token is required");
  }
  return result;
}

export const run = async (): Promise<void> => {
  const input = getInputs();
  const octokit = getOctokit(input.token);

  const ownerRepo = {
    owner: context.repo.owner,
    repo: context.repo.repo,
  };

  type Usage = RestEndpointMethodTypes["actions"]["getWorkflowRunUsage"]["response"]["data"];
  let usage: Usage = {} as Usage;
  let workflowsIds: (string | number)[] = [];
  if (input.workflows) {
    workflowsIds = input.workflows.split(",").map((workflow) => workflow.trim());
  } else {
    const { data: workflows } = await octokit.rest.actions.listRepoWorkflows(ownerRepo);
    workflowsIds = workflows.workflows.map((workflow) => workflow.id);
  }
  info(`Getting usage for workflows: ${workflowsIds.join(", ")}`);

  for (const workflowsId of workflowsIds) {
    try {
      const { data } = await octokit.rest.actions.getWorkflowUsage({
        ...ownerRepo,
        workflow_id: workflowsId,
      });

      if (usage.billable) {
        if (usage.billable.UBUNTU && data.billable.UBUNTU) {
          usage.billable.UBUNTU.total_ms += data.billable.UBUNTU.total_ms || 0;
        }
        if (usage.billable.MACOS && data.billable.MACOS) {
          usage.billable.MACOS.total_ms += data.billable.MACOS.total_ms || 0;
        }
        if (usage.billable.WINDOWS && data.billable.WINDOWS) {
          usage.billable.WINDOWS.total_ms += data.billable.WINDOWS.total_ms || 0;
        }
      }
    } catch (err) {
      info(`Error getting usage for workflows: ${workflowsId}`);
      error(JSON.stringify(err));
    }
  }

  setOutput("UBUNTU", usage.billable.UBUNTU?.total_ms || 0);
  setOutput("MACOS", usage.billable.MACOS?.total_ms || 0);
  setOutput("WINDOWS", usage.billable.WINDOWS?.total_ms || 0);
};

run();
