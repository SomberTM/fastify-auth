import fastify from "./fastify";
import prisma from "./plugins/prisma";
import userRoutes from "./users/routes";

fastify.register(prisma);
fastify.register(userRoutes, {
  prefix: "/user",
});

// Run the server!
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  // Server is now listening on ${address}
});
