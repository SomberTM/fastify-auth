import fastify from "./fastify";
import cookie from "@fastify/cookie";
import prisma from "./plugins/prisma";
import users from "./routes/users";
import dotenv from "dotenv";
dotenv.config();

fastify.register(prisma);
fastify.register(cookie);
fastify.register(users, {
  prefix: "/users",
});

// Run the server!
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  // Server is now listening on ${address}
});
