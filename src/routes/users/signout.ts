import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { hashSessionToken } from "../../utils/tokens";
import { ErrorMessage, IRedirectQuery, RedirectQuery } from "./types";

export default async function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.post<{ Querystring: IRedirectQuery }>("/signout", {
    schema: {
      querystring: RedirectQuery,
      response: {
        401: ErrorMessage
      }
    }
  }, async (request, reply) => {
    const sessionToken =
      request.cookies[process.env.SESSION_TOKEN_COOKIE_NAME!];
    if (!sessionToken) return reply.status(401).send({ message: "No user to sign out" });

    try {
      await fastify.prisma.session.delete({
        where: {
          token: hashSessionToken(sessionToken),
        },
      });
    } catch (error) {
      return reply.status(401).send({ message: "Error signing user out" });
    } finally {
      const redirectUri = request.query.redirectUri;
      if (redirectUri)
        reply.redirect(302, redirectUri);

      return reply
        .status(200)
        .clearCookie(process.env.SESSION_TOKEN_COOKIE_NAME!)
        .send();
    }

  });
}
