import { mkdirSync } from "node:fs"
import { dirname, join } from "node:path"

import { Low } from "lowdb"
import { JSONFile } from "lowdb/node"

import type { IntegratedService } from "../types/integration.js"


/**
 * This is a fallback service in case model is available or get down.
 * This is just to persis existing integrated services to be implemented when model is changed.
 * Its like a context db.
 * 
 * As this is a POCs and to avoid overengineering, we are using lowdb which is a simple JSON file based database.
 * In a production scenario, we would use a more robust solution like PostgreSQL to store json and build strong queries.
 */

interface ServicesDatabase {
  services: Array<IntegratedService>
}

const file = join(process.cwd(), "data", "services.json")
mkdirSync(dirname(file), { recursive: true })

const adapter = new JSONFile<ServicesDatabase>(file)
const db = new Low<ServicesDatabase>(adapter, { services: [] })

async function ensureData() {
  await db.read()
  if (!db.data) {
    db.data = { services: [] }
  }
}

export async function listServices(): Promise<Array<IntegratedService>> {
  await ensureData()
  return db.data!.services
}

export async function findServiceByName(name: string): Promise<IntegratedService | undefined> {
  await ensureData()
  return db.data!.services.find((service) => service.name === name)
}

export async function upsertService(service: IntegratedService): Promise<void> {
  await ensureData()
  const services = db.data!.services
  const index = services.findIndex((existing) => existing.name === service.name)

  if (index >= 0) {
    services[index] = service
  } else {
    services.push(service)
  }

  await db.write()
}
