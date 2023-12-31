import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
  ErrorMessage,
  User,
  IRedirectQuery,
  RedirectQuery,
  IUserOmitPassword,
  UserOmitPassword,
} from "./types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { getDateDaysOut, getExpiresInDays } from "../../utils/dates";
import { generateSessionToken, hashSessionToken } from "../../utils/tokens";
import { Type, Static } from "@sinclair/typebox";
import bcrypt from "bcrypt"
import { hashPassword } from "../../utils/passwords";

const SignupUser = Type.Object({
  credentials: Type.Required(Type.String()),
  email: Type.Required(Type.String()),
});
type ISignupUser = Static<typeof SignupUser>;

const saltRounds = 10;

export default async function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.post<{
    Body: ISignupUser;
    Reply: IUserOmitPassword;
    Querystring: IRedirectQuery;
  }>(
    "/signup",
    {
      schema: {
        body: SignupUser,
        querystring: RedirectQuery,
        response: {
          201: UserOmitPassword,
          400: ErrorMessage,
        },
      },
    },
    async (request, reply) => {
      const sessionToken =
        request.cookies[process.env.SESSION_TOKEN_COOKIE_NAME!];

      if (sessionToken)
        return reply.status(400).send({ message: "A signed in user cannot sign up" })

      const { credentials, email } = request.body;
      const [username, password] = credentials
        .split(":")
        .map((credential) =>
          Buffer.from(credential, "base64").toString("utf-8")
        );

      try {
        const sessionToken = generateSessionToken();
        const expiresDays = 3;
        const hashedPassword = await hashPassword(password);
        const user = await fastify.prisma.user.create({
          data: {
            username,
            password: hashedPassword,
            email,
            session: {
              create: {
                token: hashSessionToken(sessionToken),
                expiresAt: getExpiresInDays(expiresDays),
              },
            },
          },
          select: {
            id: true,
            username: true,
            email: true
          }
        });

        const redirectUri = request.query.redirectUri;
        if (redirectUri)
          reply.redirect(302, redirectUri)

        reply
          .type("application/json")
          .status(201)
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