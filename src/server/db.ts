import { PrismaLibSql } from '@prisma/adapter-libsql'
import type { Prisma } from '@prisma/generated/client'
import { PrismaClient } from '@prisma/generated/client'

const DEFAULT_DATABASE_URL = 'file:./prisma/dev.db'
const DEV_LOG_LEVELS: Prisma.LogLevel[] = ['query', 'error', 'warn']
const PROD_LOG_LEVELS: Prisma.LogLevel[] = ['error']
const DEV_LOG_MESSAGE = '[Prisma] Client created with libsql adapter'
const GLOBAL_PRISMA_KEY = 'prisma' as const

const isDevelopment = process.env.NODE_ENV === 'development'

const getDatabaseUrl = (): string => process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL

const getLogLevels = (): Prisma.LogLevel[] => (isDevelopment ? DEV_LOG_LEVELS : PROD_LOG_LEVELS)

const createPrismaClient = (): PrismaClient => {
  const adapter = new PrismaLibSql({ url: getDatabaseUrl() })

  const client = new PrismaClient({
    adapter,
    log: getLogLevels(),
  })

  if (isDevelopment) {
    // biome-ignore lint/suspicious/noConsole: Development logging
    console.log(DEV_LOG_MESSAGE)
  }

  return client
}

type GlobalForPrisma = {
  [K in typeof GLOBAL_PRISMA_KEY]: PrismaClient | undefined
}

const globalForPrisma = globalThis as unknown as GlobalForPrisma

const db: PrismaClient = globalForPrisma[GLOBAL_PRISMA_KEY] ?? createPrismaClient()

if (!isDevelopment) {
  globalForPrisma[GLOBAL_PRISMA_KEY] = db
}

export { db }
