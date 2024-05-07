'use server'

// Importing necessary libraries and modules
import { revalidatePath } from "next/cache";
import { redirect } from 'next/navigation'
import { db } from "@/lib/db/index";
import { Argon2id } from 'oslo/password'
import { generateId } from 'lucia'
import { lucia, validateRequest } from '../auth/lucia'
import {
  genericError,
  setAuthCookie,
  validateAuthFormData,
  getUserAuth,
} from '../auth/utils'
import { updateUserSchema } from "../db/schema/auth";

// Interface for the ActionResult
interface ActionResult {
  error: string
}

// Function to handle sign in action
export async function signInAction(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // Validate the form data
  const { data, error } = validateAuthFormData(formData)
  if (error !== null) return { error }

  try {
    // Check if the user exists in the database
    const existingUser = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    })
    if (!existingUser) {
      return {
        error: 'Incorrect username or password',
      }
    }

    // Verify the password
    const validPassword = await new Argon2id().verify(
      existingUser.hashedPassword,
      data.password
    )
    if (!validPassword) {
      return {
        error: 'Incorrect username or password',
      }
    }

    // Create a new session for the user
    const session = await lucia.createSession(existingUser.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    setAuthCookie(sessionCookie);

    // Redirect the user to the tasks page
    return redirect('/tasks')
  } catch (e) {
    return genericError
  }
}

// Function to handle sign up action
export async function signUpAction(
  _: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // Validate the form data
  const { data, error } = validateAuthFormData(formData)

  if (error !== null) return { error }

  // Hash the password
  const hashedPassword = await new Argon2id().hash(data.password)
  const userId = generateId(15)

  try {
    // Create a new user in the database
    await db.user.create({
      data: {
        id: userId,
        email: data.email,
        hashedPassword,
      },
    })
  } catch (e) {
    return genericError
  }

  // Create a new session for the user
  const session = await lucia.createSession(userId, {})
  const sessionCookie = lucia.createSessionCookie(session.id)
  setAuthCookie(sessionCookie)

  // Redirect the user to the tasks page
  return redirect('/tasks')
}

// Function to handle sign out action
export async function signOutAction(): Promise<ActionResult> {
  // Validate the request
  const { session } = await validateRequest()
  if (!session) {
    return {
      error: 'Unauthorized',
    }
  }

  // Invalidate the session
  await lucia.invalidateSession(session.id)

  // Set a blank session cookie
  const sessionCookie = lucia.createBlankSessionCookie()
  setAuthCookie(sessionCookie)

  // Redirect the user to the sign in page
  redirect('/sign-in')
}

// Function to update user information
export async function updateUser(
  _: any,
  formData: FormData,
): Promise<ActionResult & { success?: boolean }> {
  // Get the user's authentication information
  const { session } = await getUserAuth();
  if (!session) return { error: "Unauthorised" };

  // Get the name and email from the form data
  const name = formData.get("name") ?? undefined;
  const email = formData.get("email") ?? undefined;

  // Validate the name and email
  const result = updateUserSchema.safeParse({ name, email });

  if (!result.success) {
    const error = result.error.flatten().fieldErrors;
    if (error.name) return { error: "Invalid name - " + error.name[0] };
    if (error.email) return { error: "Invalid email - " + error.email[0] };
    return genericError;
  }

  try {
    // Update the user in the database
    await db.user.update({
      data: { ...result.data },
      where: { id: session.user.id },
    });
    revalidatePath("/account");
    return { success: true, error: "" };
  } catch (e) {
    return genericError;
  }
}