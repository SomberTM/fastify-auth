import { FastifyInstance, FastifyPluginOptions } from "fastify";
import signup from "./signup";
import _delete from "./delete";
import signout from "./signout";
import me from "./me";
import signin from "./signin";

export default async function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.register(signup);
  fastify.register(signout);
  fastify.register(signin);
  fastify.register(me);
  fastify.register(_delete);
}
