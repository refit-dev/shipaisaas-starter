"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { getUser } from "@/lib/db/queries";
import { users } from "@/lib/db/schema/account";
import { getUserById } from "@/lib/user";
import { userNameSchema } from "@/lib/validations/user";

export type FormData = {
  name: string;
};

export async function updateUserName(userId: string, data: FormData) {
  try {
    const user = await getUser();

    if (!user || user.id !== userId) {
      throw new Error("Unauthorized");
    }

    const { name } = userNameSchema.parse(data);

    // Update the user name.
    await db.update(users).set({ name: name }).where(eq(users.id, userId));

    revalidatePath("/dashboard/settings");
    return { status: "success" };
  } catch (error) {
    // console.log(error)
    return { status: "error" };
  }
}
