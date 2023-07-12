import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";
import { Static, Type } from "@sinclair/typebox";

export const CreateUser = Type.Object({
  credentials: Type.Required(Type.String()),
  email: Type.Required(Type.String()),
});
export type ICreateUser = Static<typeof CreateUser>;

export async function createUser(request: FastifyRequest, reply: FastifyReply) {
  request.body;
  return "";
}
