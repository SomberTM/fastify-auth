import { FastifyInstance, FastifyPluginOptions } from "fastify";

export default function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: () => void
) {
  fastify.post("/signout", {}, async (request, reply) => {
    const sessionToken =
      request.cookies[process.env.SESSION_TOKEN_COOKIE_NAME!];
    if (!sessionToken) return reply.status(401).send();

    try {
      await fastify.prisma.session.delete({
        where: {
          token: sessionToken,
        },
      });
    } catch (error) {
      return reply.status(401).send();
    }

    return reply
      .status(200)
      .clearCookie(process.env.SESSION_TOKEN_COOKIE_NAME!)
      .send();
  });
  done();
}
