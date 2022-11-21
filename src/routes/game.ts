import { FastifyInstance } from "fastify"
import ShortUniqueId from "short-unique-id"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { authenticate } from "../plugins/authenticate"

export async function GameRoutes(fastify: FastifyInstance){

    fastify.get('/game/count', async () => {
        const count = await prisma.game.count()
    
        return { count }
    })

    fastify.get('/groups/:id/games', {
        onRequest: [authenticate]
    }, async(request) => {
        const getGroupParams = z.object({
            id: z.string()
        })

        const { id } = getGroupParams.parse(request.params)

        const games = await prisma.game.findMany({
            orderBy: {
                date: 'desc'
            },
            include: {
                guesses: {
                    where: {
                        participant: {
                            userId: request.user.sub,
                            groupId: id,
                        }
                    }
                }
            }
        })

        return { 
            games: games.map(game => {
                return {
                    ...game,
                    guess: game.guesses.length > 0 ? game.guesses[0] : null,
                    guesses: undefined
                }
            })
        }


    })


    
}
