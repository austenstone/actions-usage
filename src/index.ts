import { getInput, info, error, setOutput, startGroup, endGroup, } from "@actions/core";
import { getOctokit, context } from "@actions/github";

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

  let usage = {
    billable: {
      UBUNTU: {
        total_ms: 0,
      },
      MACOS: {
        total_ms: 0,
      },
      WINDOWS: {
        total_ms: 0,
      },
      total_ms: 0
    },
  };
  let workflowsIds: (string | number)[] = [];
  if (input.workflows) {
    workflowsIds = input.workflows.split(",").map((workflow) => workflow.trim());
  } else {
    const { data: workflows } = await octokit.rest.actions.listRepoWorkflows(ownerRepo);
    workflowsIds = workflows.workflows.map((workflow) => workflow.id);
  }
  info(`Getting usage for ${workflowsIds.length} workflows...`);

  for (const workflowsId of workflowsIds) {
    try {
      const { data } = await octokit.rest.actions.getWorkflowUsage({
        ...ownerRepo,
        workflow_id: workflowsId,
      });

      const _usage = [
        data.billable?.UBUNTU?.total_ms,
        data.billable?.MACOS?.total_ms,
        data.billable?.WINDOWS?.total_ms
      ].map((usage) => usage || 0)
      const total = _usage.reduce((acc, curr) => acc + curr, 0);
      usage.billable.UBUNTU.total_ms += _usage[0];
      usage.billable.MACOS.total_ms += _usage[1];
      usage.billable.WINDOWS.total_ms += _usage[2];
      usage.billable.total_ms += total;
      startGroup(`Workflow: ${workflowsId} - ${total} ms`);
      info(`Ubuntu: ${data.billable?.UBUNTU?.total_ms || 0}`);
      info(`MacOS: ${data.billable?.MACOS?.total_ms || 0}`);
      info(`Windows: ${data.billable?.WINDOWS?.total_ms || 0}`);
      endGroup();
    } catch (err) {
      info(`Error getting usage for workflows: ${workflowsId}`);
      error(JSON.stringify(err));
    }
  }

  info(`✅ Completed!`);
  info(`Total Ubuntu: ${usage.billable.UBUNTU.total_ms}`);
  info(`Total MacOS: ${usage.billable.MACOS.total_ms}`);
  info(`Total Windows: ${usage.billable.WINDOWS.total_ms}`);
  info(`Total: ${usage.billable.total_ms}`);
  setOutput("ubuntu", usage.billable.UBUNTU.total_ms);
  setOutput("macos", usage.billable.MACOS.total_ms);
  setOutput("windows", usage.billable.WINDOWS.total_ms);
  setOutput("total", usage.billable.total_ms);
};

run();
