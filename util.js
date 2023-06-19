const { Octokit } = require("@octokit/rest");

async function getCommitCode(owner, repo, commitSha) {
  const octokit = new Octokit();

  try {
    const commitResponse = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: commitSha
    });

    const commitFiles = commitResponse.data.files;

    const commitCode = {};
    for (const file of commitFiles) {
      if (file.status === "modified" || file.status === "added") {
        const fileResponse = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: file.filename,
          ref: commitSha
        });

        const patch = file.patch;
        const patchLines = patch.split("\n");

        let modifiedContent = "";
        let inChangeBlock = false;
        for (const line of patchLines) {
          if (line.startsWith("+")) {
            if (!inChangeBlock) {
              inChangeBlock = true;
              // Skip the first '+' character in the line
              modifiedContent += line.substring(1) + "\n";
            } else {
              modifiedContent += line.substring(1) + "\n";
            }
          } else if (line.startsWith("-")) {
            if (inChangeBlock) {
              inChangeBlock = false;
            }
          }
        }

        commitCode[file.filename] = modifiedContent;
      }
    }

    return commitCode;
  } catch (error) {
    console.error("Error occurred:", error);
    throw error;
  }
}

module.exports = {
    getCommitCode
}
