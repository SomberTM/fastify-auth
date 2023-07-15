import { FastifyReply, FastifyRequest } from "fastify";
import { IUserOmitPassword } from "../routes/users/types";
import { hashSessionToken } from "../utils/tokens";
import fastify from "../fastify";

interface Session {
  id: string;
  token: string;
  expiresAt: number;
  userId: string;
  user: IUserOmitPassword;
}

declare module 'fastify' {
  export interface FastifyRequest {
    session?: Session;
  }
}

export default async function (request: FastifyRequest, reply: FastifyReply) {
  const sessionToken = request.cookies[process.env.SESSION_TOKEN_COOKIE_NAME!];
  if (!sessionToken)
    return request;

  const session = await fastify.prisma.session.findUnique({
    where: {
      token: hashSessionToken(sessionToken)
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true
        }
      },
    },
  })

  if (!session)
    return request;

  if (!session.userId && session.user)
    session.userId = session.user.id;

  request.session = session as Session;
} 