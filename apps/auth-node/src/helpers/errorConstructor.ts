export const generateEmptyFieldsError = (
  data: Record<string, unknown>
): Record<string, string> => {
  let errors: Record<string, string> = {};
  Object.keys(data).map((key) => {
    if (!data[key]) {
      errors[key] = `${key} is required`;
    }
  });
  return errors;
};
