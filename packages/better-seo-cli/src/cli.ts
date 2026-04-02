import { runCli } from "./run-cli.js"

void runCli(process.argv).then((code) => {
  process.exit(code)
})
