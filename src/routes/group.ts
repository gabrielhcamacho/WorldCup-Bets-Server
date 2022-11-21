import { FastifyInstance } from "fastify"
import ShortUniqueId from "short-unique-id"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { authenticate } from "../plugins/authenticate"

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

        let ownerId = null

        try{
            await request.jwtVerify()

            await prisma.group.create({
                data: {
                    title,
                    code,
                    ownerId: request.user.sub,

                    participant: {
                        create: {
                            userId: request.user.sub,
                        }
                    }
                }
            })

        } catch {
            await prisma.group.create({
                data: {
                    title,
                    code,
                }
            })
        }


    
        return reply.status(201).send({ code })
    })

    fastify.post('/groups/join', {
       onRequest: [authenticate] 
    },async (request, reply) => {
        const joinGroupBody = z.object({
            code: z.string()
        })

        const { code } = joinGroupBody.parse(request.body)

        const group = await prisma.group.findUnique({
            where: {
                code,
            },
            include: {
                participant: {
                    where: {
                        userId: request.user.sub,
                    }
                }
            }
        })

        if(!group){
            return reply.status(400).send({
                message: 'Group not found.'
            })
        }

        if(group.participant.length > 0){
            return reply.status(400).send({
                message: 'You already joined this group.'
            })
        }

        if(group.ownerId){
            prisma.group.update({
                where: {
                    id:group.id
                },
                data: {
                    ownerId: request.user.sub
                }
            })
        }

        await prisma.participant.create({
            data: {
                groupId: group.id,
                userId: request.user.sub
            }
        })

        return reply.status(201).send()

    })

    fastify.get('/groups', {
        onRequest: [authenticate]
    }, async (request) => {
        const groups = await prisma.group.findMany({
            where: {
                participant: {
                    some: {
                        userId: request.user.sub,
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        participant: true
                    }
                },
                participant:{
                    select: {
                        id: true,

                        user: {
                            select: {
                                avatarUrl: true,
                            }
                        }
                    },
                    take: 4,
                },
                owner: {
                    select: {
                        name: true,
                        id: true,
                    }
                }
            }
        })

        return { groups }
    })

    fastify.get('/pools/:id', {
        onRequest: [authenticate]
    }, async (request) => {
        const getGroupParams = z.object({
            id: z.string(),
        })

        const { id } = getGroupParams.parse(request.params)

        const group = await prisma.group.findUnique({
            where: {
               id,
            },
            include: {
                _count: {
                    select: {
                        participant: true
                    }
                },
                participant:{
                    select: {
                        id: true,

                        user: {
                            select: {
                                avatarUrl: true,
                            }
                        }
                    },
                    take: 4,
                },
                owner: {
                    select: {
                        name: true,
                        id: true,
                    }
                }
            }
        })

        return { group }

    })

}




