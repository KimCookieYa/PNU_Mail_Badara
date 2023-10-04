export const isValid = (email: string): boolean => {
  return (
    email.length > 0 &&
    email.includes("@") &&
    email.includes(".") &&
    email.split("@")[0].length >= 5
  );
};
