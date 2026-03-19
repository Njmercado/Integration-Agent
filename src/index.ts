import express from "express"

import agent from "./agent.js"
import { listServices } from "./persistence/services.js"
import { getToolAnswerFromAgentMessages } from "./utils/agent.util.js"

const app = express()
app.use(express.json())
const port = process.env.PORT ?? 3000
const MAX_RETRIES = 3

app.post("/", async (req, res) => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const requirement = req.body.requirement
      await agent.invoke(requirement)

      const toolAnswer = getToolAnswerFromAgentMessages(agent.messages)
      res.json({ response: toolAnswer })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Agent invocation failed"

      if ( i < MAX_RETRIES) {
        console.warn(`Attempt ${i + 1} failed: ${message}. Retrying...`)
        continue
      }

      res.status(500).json({ error: message })
    }
  }
})

app.get("/integrations", async (req, res) => {
  try {
    const integrations = await listServices()
    res.json({ integrations })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve integrations"
    res.status(500).json({ error: message })
  }
})

app.post("/integration", async (req, res) => {
  try {
    const body = req.body
    await agent.invoke(`Integrate the following service into the agent: ${JSON.stringify(body)}`)
    res.json({ message: "Integration added successfully" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Integration failed"
    res.status(500).json({ error: message })
  }
})

const server = process.env.NODE_ENV === "test"
  ? undefined
  : app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })

export { app, server }
export default app
