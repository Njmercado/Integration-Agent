import express from "express"
import agent from "./agent.js"
import { listServices } from "./persistence/services.js"
import dotenv from "dotenv";

dotenv.config();

const app = express()
app.use(express.json())
const port = process.env.PORT || 3000

app.get("/", (req, res) => {
  try {
    const requirement = req.body.requirement
    agent.invoke(requirement).then((response) => {
      console.log("Agent response:", response)
      return res.json({ response })
    })
  } catch (error) {
    res.status(500).json({ error })
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
    agent.invoke(`Integrate the following service into the agent: ${JSON.stringify(body)}`).then((response) => {
      console.log("Agent response:", response)
    })
    res.json({ message: "Integration added successfully" })
  } catch (error) {
    res.status(500).json({ error })
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
