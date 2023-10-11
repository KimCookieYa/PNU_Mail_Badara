import User from "../models/User.js";

// check whether the email is valid.
export function isValid(email) {
  return (
    email.length > 0 &&
    email.includes("@") &&
    email.includes(".") &&
    email.split("@")[0].length >= 5
  );
}

// check whether the email exists in the database.
export async function isExistingEmail(email) {
  return await User.findOne({ email: email });
}

export function stringToDate(dateString) {
  const dateParts = dateString.split(" ");
  const datePart = dateParts[0];
  const timePart = dateParts[1];

  const [year, month, day] = datePart.split("-");
  const [hours, minutes, seconds] = timePart.split(":");

  const milliseconds = parseFloat(seconds);

  const dateObject = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    seconds,
    milliseconds
  );
  return dateObject;
}
