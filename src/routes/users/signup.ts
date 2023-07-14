import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
  ErrorMessage,
  IUser,
  User,
  IRedirectQuery,
  RedirectQuery,
} from "./types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { getDateDaysOut, getExpiresInDays } from "../../utils/dates";
import { generateSessionToken, hashSessionToken } from "../../utils/tokens";
import { Type, Static } from "@sinclair/typebox";

const SignupUser = Type.Object({
  credentials: Type.Required(Type.String()),
  email: Type.Required(Type.String()),
});
type ISignupUser = Static<typeof SignupUser>;

export default function (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: () => void
) {
  fastify.post<{
    Body: ISignupUser;
    Reply: IUser;
    Querystring: IRedirectQuery;
  }>(
    "/signup",
    {
      schema: {
        body: SignupUser,
        querystring: RedirectQuery,
        response: {
          201: User,
          400: ErrorMessage,
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

      try {
        const sessionToken = generateSessionToken();
        const expiresDays = 3;
        const user = await fastify.prisma.user.create({
          data: {
            username,
            password,
            email,
            session: {
              create: {
                token: hashSessionToken(sessionToken),
                expiresAt: getExpiresInDays(expiresDays),
              },
            },
          },
        });

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
  done();
}

// export function signinUserRoute(fastify: FastifyInstance) {}

// export function signoutUserRoute(fastify: FastifyInstance) {}
