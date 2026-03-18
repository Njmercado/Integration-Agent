import express from "express"

import agent from "./agent.js"
import { listServices } from "./persistence/services.js"

const app = express()
app.use(express.json())
const port = process.env.PORT ?? 3000

app.post("/", async (req, res) => {
  try {
    const requirement = req.body.requirement
    const response = await agent.invoke(requirement)
    res.json({ response: response.lastMessage })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent invocation failed"
    res.status(500).json({ error: message })
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

app.post("/", async (req, res) => {
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
