import { FastifyInstance } from "fastify"
import ShortUniqueId from "short-unique-id"
import { z } from "zod"
import { prisma } from "../lib/prisma"

export async function AuthRoutes(fastify: FastifyInstance){

    fastify.post('/users', async (request) => {
        
        const createUserBody = z.object({
            access_token: z.string()
        })


        const { access_token } = createUserBody.parse(request.body)
    })
}
