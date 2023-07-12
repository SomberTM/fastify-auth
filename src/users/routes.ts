import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { createUser, CreateUser, ICreateUser } from "./controllers";

export default function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: () => void
) {
  fastify.post<{ Body: ICreateUser }>(
    "/signup",
    {
      schema: {
        body: CreateUser,
      },
    },
    createUser
  );

  done();
}
