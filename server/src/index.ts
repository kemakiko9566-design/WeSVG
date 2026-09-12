import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import { writeFile, mkdir } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'

const PORT = Number(process.env.PORT) || 4000
const UPLOAD_DIR = join(process.cwd(), 'uploads')

async function main() {
  const app = Fastify({ logger: true })

  await app.register(cors, { origin: true })
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } })

  // Ensure upload dir exists
  await mkdir(UPLOAD_DIR, { recursive: true })

  // Health
  app.get('/api/v1/health', async () => ({ status: 'ok', service: 'wesvg-studio-server' }))

  // Remove background — accepts image file, returns transparent PNG
  app.post('/api/v1/image/remove-bg', async (req, reply) => {
    try {
      const data = await req.file()
      if (!data) {
        return reply.status(400).send({ success: false, message: 'No file uploaded' })
      }

      const ext = extname(data.filename) || '.png'
      const filename = `bg-removed-${randomUUID()}${ext}`
      const filepath = join(UPLOAD_DIR, filename)

      // Save uploaded file
      const buffer = await data.toBuffer()
      await writeFile(filepath, buffer)

      // TODO: Integrate briaai/RMBG-2.0
      // const { pipeline } = await import('@xenova/transformers')
      // const model = await pipeline('image-segmentation', 'briaai/RMBG-2.0')
      // const result = await model(image)
      // ... process result, save transparent PNG

      // For now, return the original image as pass-through
      const transparentUrl = `http://localhost:${PORT}/uploads/${filename}`

      return {
        success: true,
        transparentUrl,
        message: 'RMBG-2.0 integration pending — returning original image',
      }
    } catch (e) {
      app.log.error(e)
      return reply.status(500).send({
        success: false,
        message: e instanceof Error ? e.message : 'Internal error',
      })
    }
  })

  // Serve uploaded files via static
  app.register(fastifyStatic, {
    root: UPLOAD_DIR,
    prefix: '/uploads/',
  })

  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`Server running on http://localhost:${PORT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
