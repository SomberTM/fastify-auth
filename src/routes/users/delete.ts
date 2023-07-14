import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { IUserOmitPassword, UserOmitPassword, ErrorMessage } from "./types";
import { Type, Static } from "@sinclair/typebox";

const DeleteUser = Type.Object({
  id: Type.Required(Type.String()),
  password: Type.String(),
});
type IDeleteUser = Static<typeof DeleteUser>;

export default function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: () => void
) {
  fastify.delete<{ Body: IDeleteUser; Reply: IUserOmitPassword }>(
    "/",
    {
      schema: {
        body: DeleteUser,
        response: {
          200: UserOmitPassword,
          400: ErrorMessage,
          404: ErrorMessage,
        },
      },
    },
    async (request, reply) => {
      const { id, password: passwordAsBase64 } = request.body;
      const user = await fastify.prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user)
        return reply.status(404).send({ message: `User '${id}' not found` });

      const password = Buffer.from(passwordAsBase64, "base64").toString(
        "utf-8"
      );
      if (user.password !== password)
        return reply.status(400).send({ message: `Incorrect password` });

      const deletedUser = await fastify.prisma.user.delete({
        where: {
          id,
        },
        select: {
          id: true,
          username: true,
          email: true,
        },
      });
      if (!deletedUser)
        return reply
          .status(500)
          .send({ message: `Unknown error occurred deleting user` });

      reply.clearCookie(process.env.SESSION_TOKEN_COOKIE_NAME!);
      return deletedUser;
    }
  );
  done();
}
