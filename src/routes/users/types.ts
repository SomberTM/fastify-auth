import { Type, Static } from "@sinclair/typebox";

export const SigninUser = Type.Object({
  credentials: Type.Required(Type.String()),
});

export const User = Type.Object({
  id: Type.String(),
  username: Type.String(),
  email: Type.String(),
  password: Type.String(),
});
export type IUser = Static<typeof User>;

export const UserOmitPassword = Type.Omit(User, ["password"]);
export type IUserOmitPassword = Static<typeof UserOmitPassword>;

export const RedirectQuery = Type.Object({
  redirectUri: Type.Optional(Type.String()),
});
export type IRedirectQuery = Static<typeof RedirectQuery>;

export const ErrorMessage = Type.Object({
  message: Type.String(),
});
export type IErrorMessage = Static<typeof ErrorMessage>;
