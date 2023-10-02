export const isValid = (email: string) => {
  return (
    email &&
    email.includes("@") &&
    email.includes(".") &&
    email.split("@")[0].length >= 5
  );
};
