import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { PrismaClient } from "@prisma/client";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

function prismaPlugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: () => void
) {
  if (!fastify.prisma) {
    const prisma = new PrismaClient();
    fastify.decorate("prisma", prisma);
    fastify.log.info("PrismaClient connected");

    fastify.addHook("onClose", async (fastify, done) => {
      if (fastify.prisma === prisma) {
        await fastify.prisma.$disconnect();
        fastify.log.info("PrismaClient disconnected");
        done();
      }
    });
  }

  done();
}

export default fastifyPlugin(prismaPlugin, {
  name: "fastify-prisma-plugin",
});