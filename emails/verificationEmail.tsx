import * as React from "react";

interface EmailTemplateProps {
  username: string;
  otp: string;
}

export function VarificationEmail({
  username,
  otp,
}: EmailTemplateProps) {
  return (
    <div style={{ fontFamily: "Roboto, Verdana, sans-serif" }}>
      <h2>Hello {username},</h2>
      <p>
        Thank you for registering. Please use the following verification
        code to complete your registration:
      </p>
      <h2 style={{ letterSpacing: "4px" }}>{otp}</h2>
      <p>If you did not request this code, please ignore this email.</p>
    </div>
  );
}
