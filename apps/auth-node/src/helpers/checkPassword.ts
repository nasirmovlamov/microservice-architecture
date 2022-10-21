export const generatePasswordStrongError =  (password: string) => {
  const hasNumber = /\d/;
  const hasUpper = /[A-Z]/;
  const hasLower = /[a-z]/;
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  const hasEightChars = /.{8,}/;
  const errors: Record<string, unknown> = {};
  if (
    !hasNumber.test(password) ||
    !hasUpper.test(password) ||
    !hasLower.test(password) ||
    !hasSpecial.test(password) ||
    !hasEightChars.test(password)
  ) {
    errors.password =
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
  }
  return errors;
};
