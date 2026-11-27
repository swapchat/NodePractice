const validator = require("validator");

const allowedSignupFields = new Set([
  "firstName",
  "lastName",
  "email",
  "password",
  "age",
  "gender",
]);

const passwordOptions = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
};

const meetsPasswordStrengthRequirements = (password) =>
  typeof password === "string" &&
  validator.isStrongPassword(password, passwordOptions);

const validateSignupInput = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return [{ field: "body", message: "Request body must be a JSON object" }];
  }

  const errors = Object.keys(body)
    .filter((field) => !allowedSignupFields.has(field))
    .map((field) => ({ field, message: "This field is not allowed" }));

  if (!meetsPasswordStrengthRequirements(body.password)) {
    errors.push({
      field: "password",
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol characters.",
    });
  }

  return errors;
};

module.exports = {
  validateSignupInput,
};
