import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
  ErrorMessage,
  IUser,
  User,
  IRedirectQuery,
  RedirectQuery,
  IUserOmitPassword,
} from "./types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { getDateDaysOut, getExpiresInDays } from "../../utils/dates";
import { generateSessionToken, hashSessionToken } from "../../utils/tokens";
import { Type, Static } from "@sinclair/typebox";
import { comparePassword } from "../../utils/passwords";

const SigninUser = Type.Object({
  credentials: Type.Required(Type.String()),
});
type ISigninUser = Static<typeof SigninUser>;

export default async function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.post<{
    Body: ISigninUser;
    Reply: IUserOmitPassword;
    Querystring: IRedirectQuery;
  }>(
    "/signin",
    {
      schema: {
        body: SigninUser,
        querystring: RedirectQuery,
        response: {
          201: User,
          400: ErrorMessage,
        },
      },
    },
    async (request, reply) => {
      const sessionToken =
        request.cookies[process.env.SESSION_TOKEN_COOKIE_NAME!];

      if (sessionToken)
        return reply.status(400).send({ message: "Cannot sign in again" })

      const { credentials } = request.body;
      const [username, password] = credentials
        .split(":")
        .map((credential) =>
          Buffer.from(credential, "base64").toString("utf-8")
        );


      try {
        const existingUser = await fastify.prisma.user.findUnique({
          where: {
            username
          }
        });

        if (!existingUser)
          return reply.status(400).send({ message: "Incorrect credentials" })

        const isCorrectPassword = await comparePassword(password, existingUser.password);
        if (!isCorrectPassword)
          return reply.status(400).send({ message: "Incorrect credentials" })

        const sessionToken = generateSessionToken();
        const expiresDays = 3;
        const user = await fastify.prisma.user.update({
          where: {
            username,
          },
          data: {
            session: {
              create: {
                token: hashSessionToken(sessionToken),
                expiresAt: getExpiresInDays(expiresDays)
              }
            }
          },
          select: {
            id: true,
            username: true,
            email: true
          }
        });

        if (!user)
          return reply.status(400).send({ message: "Incorrect credentials" })

        reply
          .type("application/json")
          .status(200)
          .setCookie(process.env.SESSION_TOKEN_COOKIE_NAME!, sessionToken, {
            expires: getDateDaysOut(expiresDays),
            path: "/",
          });
        return user;
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          const message = error.message;
          switch (error.code) {
            case "P2002":
              return reply.status(400).send({
                message: message.substring(message.indexOf("Unique")),
              });
          }
        }
      }
    }
  );
}