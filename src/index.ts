import { getInput, info, error, setOutput, startGroup, endGroup, } from "@actions/core";
import { getOctokit } from "@actions/github";

interface Input {
  token: string;
  workflows: string;
  org: string;
  repo: string;
}

const getInputs = (): Input => {
  const result = {} as Input;
  result.token = getInput("github-token");
  result.org = getInput("org");
  result.repo = getInput("repo");
  if (result.repo.includes("/")) {
    const parts = result.repo.split("/");
    result.repo = parts[1];
  }
  result.workflows = getInput("workflows");
  if (!result.token || result.token === "") {
    throw new Error("github-token is required");
  }
  return result;
}

const msToMinutes = (ms: number | undefined): number => {
  return ms ? Math.floor(ms / 1000 / 60) : 0;
}

export const run = async (): Promise<void> => {
  const input = getInputs();
  const octokit = getOctokit(input.token);

  const ownerRepo = {
    owner: input.org,
    repo: input.repo,
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
  info(`Getting usage for ${workflowsIds.length} workflows (in minutes)...`);

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
      startGroup(`Workflow: ${workflowsId} - ${msToMinutes(total)}`);
      info(`Ubuntu: ${msToMinutes(data.billable?.UBUNTU?.total_ms) || 0}`);
      info(`MacOS: ${msToMinutes(data.billable?.MACOS?.total_ms) || 0}`);
      info(`Windows: ${msToMinutes(data.billable?.WINDOWS?.total_ms) || 0}`);
      endGroup();
    } catch (err) {
      info(`Error getting usage for workflows: ${workflowsId}`);
      error(JSON.stringify(err));
    }
  }

  info(`✅ Completed!`);
  info(`Total Ubuntu: ${msToMinutes(usage.billable.UBUNTU.total_ms)}`);
  info(`Total MacOS: ${msToMinutes(usage.billable.MACOS.total_ms)}`);
  info(`Total Windows: ${msToMinutes(usage.billable.WINDOWS.total_ms)}`);
  info(`Total: ${msToMinutes(usage.billable.total_ms)}`);
  setOutput("ubuntu", msToMinutes(usage.billable.UBUNTU.total_ms));
  setOutput("macos", msToMinutes(usage.billable.MACOS.total_ms));
  setOutput("windows", msToMinutes(usage.billable.WINDOWS.total_ms));
  setOutput("total", msToMinutes(usage.billable.total_ms));
};

run();
