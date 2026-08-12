import fs from 'node:fs'
import path from 'node:path'

const appDir = process.cwd()
const envPath = path.join(appDir, '.env')
const publicDir = path.join(appDir, 'ios', 'App', 'App', 'public')

if (!fs.existsSync(envPath)) {
  throw new Error('No existe .env. No se puede verificar el paquete iOS.')
}

const fileEnv = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .map((line) => {
      const separator = line.indexOf('=')
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
    }),
)

const required = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_TONNER_PAINT_API_URL',
]

if (!fs.existsSync(publicDir)) {
  throw new Error(`No existe la carpeta iOS sincronizada: ${publicDir}`)
}

const files = []
for (const entry of fs.readdirSync(publicDir, { withFileTypes: true })) {
  if (entry.isFile()) files.push(path.join(publicDir, entry.name))
  if (entry.isDirectory()) {
    for (const nested of fs.readdirSync(path.join(publicDir, entry.name))) {
      files.push(path.join(publicDir, entry.name, nested))
    }
  }
}

const content = files
  .filter((file) => fs.statSync(file).isFile())
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n')

const env = Object.fromEntries(
  required.map((name) => [name, process.env[name]?.trim() || fileEnv[name]]),
)

const missing = required.filter((name) => !env[name] || !content.includes(env[name]))
if (missing.length > 0) {
  throw new Error(
    `El paquete iOS no contiene la configuración requerida: ${missing.join(', ')}. Ejecuta npm run cap:sync:ios.`,
  )
}

console.log('Configuración Supabase y TonnerPaint verificada en ios/App/App/public.')
