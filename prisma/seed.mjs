// Seeds the demo account so the "Continue as demo user" button on /login
// always has a real, working account to sign in as.
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const DEMO_USER_EMAIL = "demo@sip.dev"
const DEMO_USER_PASSWORD = "demo-portal"

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_USER_PASSWORD, 10)
  await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: {},
    create: {
      email: DEMO_USER_EMAIL,
      passwordHash,
      name: "Demo user",
    },
  })
  console.log(`Seeded demo user: ${DEMO_USER_EMAIL}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
