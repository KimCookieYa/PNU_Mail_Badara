import User from "../models/User.js";

export function isValid(email) {
  return (
    email &&
    email.includes("@") &&
    email.includes(".") &&
    email.split("@")[0].length >= 5
  );
}

// check whether the email exists in the database
export async function isExistingEmail(email) {
  return await User.findOne({ email: email });
}

// check whether the email verification period(10min) has expired.
export function isExpired(startTime) {
  const endTime = new Date();
  const diff = endTime.getTime() - startTime.getTime();
  return diff > 1000 * 60 * 10;
}
