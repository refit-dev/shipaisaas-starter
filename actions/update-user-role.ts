"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { getUser } from "@/lib/db/queries";
import { users } from "@/lib/db/schema/account";
import { userRoleSchema } from "@/lib/validations/user";

export type FormData = {
  role: string;
};

export async function updateUserRole(userId: string, data: FormData) {
  try {
    const user = await getUser();

    if (!user || user.id !== userId) {
      throw new Error("Unauthorized");
    }

    const { role } = userRoleSchema.parse(data);

    // Update the user role.
    await db.update(users).set({ role: role }).where(eq(users.id, userId));

    revalidatePath("/dashboard/settings");
    return { status: "success" };
  } catch (error) {
    // console.log(error)
    return { status: "error" };
  }
}
