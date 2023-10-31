const express = require("express");
const childProcess = require("child_process");

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.static("dist"));
app.use(express.json());

function spawn(command, args) {
  return new Promise((resolve) => {
    const p = childProcess.spawn(command, args);
    const stdouts = [];
    const stderrs = [];

    p.stdout.on("data", (data) => {
      stdouts.push(data);
    });

    p.stderr.on("data", (data) => {
      stderrs.push(data);
    });

    p.on("close", (code) => {
      resolve({
        code: code,
        stdout: Buffer.concat(stdouts).toString(),
        stderr: Buffer.concat(stderrs).toString(),
      });
    });
  });
}

async function runRuby(code) {
  return await spawn("ruby", ["-e", decodeURIComponent(code)]);
}

app.post("/rpc/rce", async (req, res) => {
  console.log(req.body);
  const { code } = req.body;
  const out = await runRuby(code);
  console.log(out);
  res.json(out);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
