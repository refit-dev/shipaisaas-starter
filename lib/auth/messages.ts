/**
 * Returns the appropriate message text based on the message type for auth pages
 * @param messageType - The type of message to display
 * @returns The localized message text or null if message type is not found
 */
export function getAuthMessage(messageType: string | null): string | null {
  if (!messageType) return null;

  const messages: Record<string, string> = {
    // Password Reset Messages
    "password-reset-success": "Your password has been successfully changed.",
    "password-reset-sent":
      "A password reset email has been sent to your address.",
    "password-reset-expired":
      "The reset link has expired. Please request a new one.",
    "password-reset-invalid": "The reset link is invalid.",

    // Sign Up Messages
    "signup-success": "Your account has been successfully created.",
    "signup-email-sent": "A verification email has been sent to your address.",
    "signup-email-verified": "Your email has been successfully verified.",
    "signup-already-exists":
      "An account with this email address already exists.",

    // Sign In Messages
    "signin-success": "Signed in successfully.",
    "signin-invalid": "Incorrect email or password.",
    "signin-required": "You must sign in to access this page.",
    "signin-email-not-verified": "Please verify your email before signing in.",
    "signin-account-locked": "Your account has been temporarily locked.",

    // OTP Messages
    "otp-sent": "A verification code has been sent to your email.",
    "otp-resent": "A new verification code has been sent.",
    "otp-invalid": "The verification code is invalid or expired.",
    "otp-expired": "The verification code has expired.",
    "otp-verified": "Verification code confirmed.",

    // Session Messages
    "session-expired": "Your session has expired. Please sign in again.",
    "session-invalid": "Invalid session. Please sign in again.",
    "logout-success": "You have been signed out successfully.",

    // Generic Messages
    unauthorized: "Unauthorized access.",
    forbidden: "You do not have the necessary permissions.",
    "server-error": "A server error occurred. Please try again.",
    "network-error": "Connection error. Check your internet connection.",
    "validation-error": "Please check the entered information.",

    // Account Messages
    "account-created": "Your account has been successfully created.",
    "account-deleted": "Your account has been deleted.",
    "account-updated": "Your information has been updated.",
    "account-suspended": "Your account has been suspended.",

    // Email Messages
    "email-change-sent":
      "A confirmation email has been sent to your new address.",
    "email-change-success": "Your email address has been successfully changed.",
    "email-verification-sent": "A verification email has been sent.",
    "email-verification-required": "You must verify your email address.",

    // Invitation Messages
    "invite-sent": "The invitation has been sent successfully.",
    "invite-accepted": "Invitation accepted successfully.",
    "invite-expired": "This invitation has expired.",
    "invite-invalid": "This invitation is invalid.",

    // Two-Factor Authentication Messages
    "2fa-enabled": "Two-factor authentication has been enabled.",
    "2fa-disabled": "Two-factor authentication has been disabled.",
    "2fa-required": "Two-factor authentication is required.",
    "2fa-invalid": "Invalid authentication code.",
  };

  return messages[messageType] || null;
}

/**
 * Returns the message type (success, error, warning, info) for styling purposes
 * @param messageType - The type of message
 * @returns The style type for the message
 */
export function getAuthMessageType(
  messageType: string,
): "success" | "error" | "warning" | "info" {
  const successMessages = [
    "password-reset-success",
    "signup-success",
    "signup-email-verified",
    "signin-success",
    "otp-verified",
    "logout-success",
    "account-created",
    "account-updated",
    "email-change-success",
    "invite-accepted",
    "2fa-enabled",
    "2fa-disabled",
  ];

  const errorMessages = [
    "password-reset-expired",
    "password-reset-invalid",
    "signup-already-exists",
    "signin-invalid",
    "signin-account-locked",
    "otp-invalid",
    "otp-expired",
    "session-expired",
    "session-invalid",
    "unauthorized",
    "forbidden",
    "server-error",
    "network-error",
    "validation-error",
    "account-suspended",
    "invite-expired",
    "invite-invalid",
    "2fa-invalid",
  ];

  const warningMessages = [
    "signin-required",
    "signin-email-not-verified",
    "email-verification-required",
    "2fa-required",
  ];

  if (successMessages.includes(messageType)) return "success";
  if (errorMessages.includes(messageType)) return "error";
  if (warningMessages.includes(messageType)) return "warning";

  return "info"; // Default for informational messages
}
