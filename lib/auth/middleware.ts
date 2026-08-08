import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { z } from "zod";

import { TeamDataWithMembers, User } from "@/lib/db/schema/account";

import { getCurrentTeam, getCurrentUser } from "./actions";

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>,
) {
  return async (prevState: ActionState, formData: FormData) => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.issues[0].message };
    }

    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User,
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>,
) {
  return async (prevState: ActionState, formData: FormData) => {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("User is not authenticated");
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.issues[0].message }; // Property 'errors' does not exist on type 'ZodError<output<S>>'.ts(2339)
    }

    return action(result.data, formData, user as any);
  };
}

type ActionWithTeamFunction<T> = (
  formData: FormData,
  team: TeamDataWithMembers,
) => Promise<T>;

export function withTeam<T>(action: ActionWithTeamFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/login");
    }

    const team = await getCurrentTeam();
    if (!team) {
      throw new Error("Team not found");
    }

    return action(formData, team as any);
  };
}

/**
 * Wrapper for authenticated API routes.
 * Automatically injects the logged-in user and their team.
 *
 * Example usage:
 * export const POST = withAuth(async ({ req, user, team, routeParams }) => { ... })
 */
export function withAuth(
  handler: (params: {
    req: Request;
    user: {
      id: string;
      email: string;
      name: string;
      role: string | null | undefined;
    };
    team: any;
    routeParams: Record<string, string>;
  }) => Promise<Response> | Response,
) {
  return async function (
    req: Request,
    context: { params: Promise<Record<string, string>> },
  ) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json(
          { error: "User not authenticated" },
          { status: 401 },
        );
      }

      const team = await getCurrentTeam();
      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      const resolvedParams = await context.params;

      // const resolvedParams = context?.params ? await context.params : {};

      return await handler({
        req,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        team,
        routeParams: resolvedParams,
      });
    } catch (error) {
      console.error("Auth wrapper error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}

export function withAdminAuth(
  handler: (params: {
    req: Request;
    user: {
      id: string;
      email: string;
      name: string;
      role: string | null | undefined;
    };
    routeParams: Record<string, string>;
  }) => Promise<Response> | Response,
) {
  return async function (
    req: Request,
    context: { params: Promise<Record<string, string>> },
  ) {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json(
          { error: "User not authenticated" },
          { status: 401 },
        );
      }

      const resolvedParams = await context.params;

      return await handler({
        req,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        routeParams: resolvedParams,
      });
    } catch (error) {
      console.error("Auth wrapper error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}
