import { jwtVerify, SignJWT } from "jose";

if (!process.env.WORKFLOW_TOKEN_SECRET) {
  throw new Error("Missing env: WORKFLOW_TOKEN_SECRET must be set");
}
const secret = new TextEncoder().encode(process.env.WORKFLOW_TOKEN_SECRET);

export type TokenPayload =
  | {
      type: "plan_approval";
      workflowId: string;
    }
  | {
      type: "step_approval";
      workflowId: string;
      runId: number;
      conversationId: string;
      stepIndex: number;
    };

export async function signToken(
  payload: TokenPayload,
  expiresIn: "2h" | "24h" = "24h",
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as TokenPayload;
}
