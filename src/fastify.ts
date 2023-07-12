import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { PrismaClient } from "@prisma/client";
import fastify from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export default fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();
