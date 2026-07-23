import { auth } from "../../lib/auth.js";
import prisma from "../../config/prisma.js";

const generateSocietyCode = (name) => {
  const cleaned = name
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 12);
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${cleaned}${suffix}`;
};

const isCodeUnique = async (code) => {
  const existing = await prisma.society.findUnique({
    where: { societyCode: code },
    select: { id: true },
  });
  return !existing;
};

const generateUniqueSocietyCode = async (name) => {
  let code = generateSocietyCode(name);
  let attempts = 0;

  while (!(await isCodeUnique(code)) && attempts < 10) {
    code = generateSocietyCode(name);
    attempts++;
  }

  return code;
};

export const registerSociety = async (data) => {
  let authUser;
  try {
   authUser = await auth.api.signUpEmail({
    body: {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      name: `${data.firstName} ${data.lastName}`,
      role: "SOCIETY_ADMIN",
    },
  }); 
 } catch (error) {
  if (
    error.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
  ) {
    const err = new Error("Email already exists");
    err.code = "USER_ALREADY_EXISTS";
    throw err;
  }

  throw error;
}

  try {
    const result = await prisma.$transaction(async (tx) => {
      const societyCode = await generateUniqueSocietyCode(data.societyName);

      const society = await tx.society.create({
        data: {
          name: data.societyName,
          societyCode,
          registrationNumber: data.registrationNumber || null,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          logo: data.logo || null,
          createdById: authUser.user.id,
        },
      });

      const user = await tx.user.update({
        where: { id: authUser.user.id },
        data: { societyId: society.id },
      });

      return { user, society };
    });

    return {
      user: {
        id: result.user.id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role,
      },
      society: {
        id: result.society.id,
        name: result.society.name,
        societyCode: result.society.societyCode,
        registrationNumber: result.society.registrationNumber,
        address: result.society.address,
        city: result.society.city,
        state: result.society.state,
        pincode: result.society.pincode,
        contactEmail: result.society.contactEmail,
        contactPhone: result.society.contactPhone,
        logo: result.society.logo,
        status: result.society.status,
      },
    };
  } catch (error) {
    await prisma.user.delete({ where: { id: authUser.user.id } });
    throw error;
  }
};
