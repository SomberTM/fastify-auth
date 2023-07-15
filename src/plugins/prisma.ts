import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { PrismaClient } from "@prisma/client";

async function prismaPlugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  if (!fastify.prisma) {
    const prisma = new PrismaClient();
    fastify.decorate("prisma", prisma);
    fastify.log.info("PrismaClient connected");

    fastify.addHook("onClose", async (fastify) => {
      if (fastify.prisma === prisma) {
        await fastify.prisma.$disconnect();
        fastify.log.info("PrismaClient disconnected");
      }
    });
  }
}

export default fastifyPlugin(prismaPlugin, {
  name: "fastify-prisma-plugin",
});
