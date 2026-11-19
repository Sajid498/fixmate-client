
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z
    .string()
    .min(6)
    .max(128)
    .regex(/[A-Z]/, "Password must contain an uppercase letter.")
    .regex(/[a-z]/, "Password must contain a lowercase letter."),
  role: z.enum(["customer", "technician"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error.issues[0]?.message ||
            "Invalid registration details.",
        },
        { status: 400 },
      );
    }

    const { name, password, role } = validation.data;
    const email = validation.data.email.toLowerCase();

    const registrationResponse = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
      headers: request.headers,
      asResponse: true,
    });

    if (!registrationResponse.ok) {
      return registrationResponse;
    }

    const registrationResult = await registrationResponse.clone().json();

    if (!registrationResult.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Account creation could not be verified.",
        },
        { status: 500 },
      );
    }

    const database = await getDatabase();

    const updateResult = await database.collection("users").updateOne(
      {
        email,
      },
      {
        $set: {
          role,
          updatedAt: new Date(),
        },
      },
    );

    if (updateResult.matchedCount !== 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account was created, but role assignment failed. Please contact support.",
        },
        { status: 500 },
      );
    }

    const signInResponse = await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe: true,
      },
      headers: request.headers,
      asResponse: true,
    });

    if (!signInResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account was created, but automatic sign-in failed. Please sign in manually.",
        },
        { status: 500 },
      );
    }

    return signInResponse;
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Registration failed. Please try again.",
      },
      { status: 500 },
    );
  }
}
