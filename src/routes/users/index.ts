import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { CreateUser, ICreateUser, IUser, User } from "./types";

export function createUserRoute(fastify: FastifyInstance) {
  fastify.post<{ Body: ICreateUser; Reply: IUser }>(
    "/signup",
    {
      schema: {
        body: CreateUser,
        response: {
          201: User,
        },
      },
    },
    async (request, reply) => {
      const { credentials, email } = request.body;
      const [username, password] = credentials
        .split(":")
        .map((credential) =>
          Buffer.from(credential, "base64").toString("utf-8")
        );

      const user = await fastify.prisma.user.create({
        data: {
          username,
          password,
          email,
        },
      });

      await fastify.prisma.user.delete({
        where: {
          id: user.id,
        },
      });

      reply.type("application/json").status(201);
      return user;
    }
  );
}

export default function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: () => void
) {
  createUserRoute(fastify);

  done();
}
