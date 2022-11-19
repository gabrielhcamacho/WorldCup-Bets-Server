import { FastifyInstance } from "fastify"
import ShortUniqueId from "short-unique-id"
import { z } from "zod"
import { prisma } from "../lib/prisma"

export async function GroupRoutes(fastify: FastifyInstance){

    fastify.get('/groups/count', async () => {
        const count = await prisma.group.count()
    
        return { count }
    })


    fastify.post('/groups', async (request, reply) => {
        //para não deixar criar o campo null, se puder ser nulo coloca o nullable
        const createGroupBody = z.object({
            title: z.string(),
        })
        
        const { title } = createGroupBody.parse(request.body)
    
        const generate = new ShortUniqueId({ length: 6 })
        const code =  String(generate()).toUpperCase()
    
        await prisma.group.create({
            data: {
                title,
                code,
            }
        })
    
        return reply.status(201).send({ code })
    })

}




