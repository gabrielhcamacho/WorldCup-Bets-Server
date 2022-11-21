import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import { GroupRoutes } from './routes/group'
import { GameRoutes } from './routes/game'
import { GuessRoutes } from './routes/guess'
import { UserRoutes } from './routes/user'
import { AuthRoutes } from './routes/auth'




async function start() {

    const fastify = Fastify({
        logger: true,
    })

    //esse codigo permite qualquer aplicacao acessar o nosso backend
    await fastify.register(cors, {
        origin: true
        // depois de feito o deploy coloca o dominio, ex origin: www.byra.com
    })

    await fastify.register(jwt, {
        secret: `${process.env.secretJWT}`,
    })

    await fastify.register(AuthRoutes)
    await fastify.register(GameRoutes)
    await fastify.register(GroupRoutes)
    await fastify.register(GuessRoutes)
    await fastify.register(UserRoutes)
    


    await fastify.listen({ port: 3333 })
}

start()