import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { IUserOmitPassword, UserOmitPassword, ErrorMessage } from "./types";

export default async function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.get<{ Reply: IUserOmitPassword }>(
    "/me",
    {
      schema: {
        response: {
          200: UserOmitPassword,
          401: ErrorMessage,
        },
      },
    },
    async (request, reply) => {
      if (!request.session)
        return reply.status(401).send({ message: "You are not signed in" })

      return request.session.user;
    }
  );
}
