import { FastifyInstance, FastifyPluginOptions } from "fastify";
import signup from "./signup";
import _delete from "./delete";
import signout from "./signout";

export default function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: () => void
) {
  fastify.register(signup);
  fastify.register(signout);
  fastify.register(_delete);
  done();
}
