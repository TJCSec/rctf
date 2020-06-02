import config from '../../config/server'
import clientConfig from '../../config/client'
import { promises as fs } from 'fs'
import mustache from 'mustache'
import fastifyCors from 'fastify-cors'
import { responses } from '../responses'

export * as normalize from './normalize'
export * as validate from './validate'
export * as scores from './scores'
export * as email from './email'

export const notStarted = () => {
  return [
    responses.badNotStarted,
    {
      startTime: config.startTime
    }
  ]
}

// This function does not work for non JSON stringifiable objects
export const deepCopy = data => {
  return JSON.parse(JSON.stringify(data))
}

export const reloadModule = m => {
  delete require.cache[require.resolve(m)]
  return require(m)
}

export const enableCORS = async (fastify, opts) => {
  if (config.corsOrigin !== undefined) {
    fastify.use(fastifyCors, {
      origin: config.corsOrigin,
      allowedHeaders: ['Authorization', 'Content-Type'],
      methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE']
    })
  }
}

export const serveIndex = async (fastify, opts) => {
  const indexTemplate = (await fs.readFile(opts.indexPath)).toString()

  const rendered = mustache.render(indexTemplate, {
    jsonConfig: JSON.stringify(clientConfig),
    config: clientConfig
  })

  const routeHandler = async (req, reply) => {
    reply.type('text/html; charset=UTF-8')
    reply.send(rendered)
  }

  const redirectHandler = async (req, reply) => {
    reply.redirect(301, '/')
  }

  fastify.get('/', routeHandler)
  fastify.get('/index.html', redirectHandler)
  fastify.get('//*', async (req, reply) => {
    reply.redirect(301, '/' + req.params['*'].replace(/^\/*/, ''))
  })
  fastify.setNotFoundHandler(routeHandler)
}

// Parse Cloudflare CF-Connecting-IP header
export const getRealIp = (req) => {
  return req.headers['cf-connecting-ip'] || req.ip
}
