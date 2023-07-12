import { Type, Static } from "@sinclair/typebox";

export const CreateUser = Type.Object({
  credentials: Type.Required(Type.String()),
  email: Type.Required(Type.String()),
});
export type ICreateUser = Static<typeof CreateUser>;

export const User = Type.Object({
  id: Type.String(),
  username: Type.String(),
  email: Type.String(),
  password: Type.String(),
});
export type IUser = Static<typeof User>;
