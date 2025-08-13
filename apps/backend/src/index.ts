import Fastify from 'fastify'

const port = 3001

export const app = Fastify()

app.listen({ port })
