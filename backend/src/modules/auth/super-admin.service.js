import { auth } from "../../lib/auth.js";

export const registerSuperAdmin = async ({ firstName, lastName, email, password }) => {
  const result = await auth.api.signUpEmail({
    body: {
      name: `${firstName} ${lastName}`,
      email,
      password,
      firstName,
      lastName,
      role: "SUPER_ADMIN",
    },
  });

  return {
    id: result.user.id,
    firstName: result.user.firstName,
    lastName: result.user.lastName,
    email: result.user.email,
    role: result.user.role,
  };
};
