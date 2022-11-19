import { FastifyInstance } from "fastify"
import ShortUniqueId from "short-unique-id"
import { prisma } from "../lib/prisma"

export async function GameRoutes(fastify: FastifyInstance){

    fastify.get('/game/count', async () => {
        const count = await prisma.game.count()
    
        return { count }
    })


    
}
