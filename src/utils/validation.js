const validator = require("validator");

const allowedSignupFields = new Set([
  "firstName",
  "lastName",
  "email",
  "password",
  "age",
  "gender",
  "about",
  "photoUrl",
  "skills",
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

const validateCommonUserFields = (body) => {
  const errors = [];

  if (
    Object.prototype.hasOwnProperty.call(body, "age") &&
    (typeof body.age !== "number" ||
      !Number.isInteger(body.age) ||
      body.age < 18)
  ) {
    errors.push({
      field: "age",
      message: "Age must be an integer of at least 18",
    });
  }

  if (
    Object.prototype.hasOwnProperty.call(body, "gender") &&
    (typeof body.gender !== "string" ||
      !["male", "female", "other"].includes(body.gender.toLowerCase()))
  ) {
    errors.push({
      field: "gender",
      message: "Gender must be male, female, or other",
    });
  }

  if (
    Object.prototype.hasOwnProperty.call(body, "about") &&
    (typeof body.about !== "string" || body.about.trim().length > 500)
  ) {
    errors.push({
      field: "about",
      message: "About must be a string of at most 500 characters",
    });
  }

  if (Object.prototype.hasOwnProperty.call(body, "photoUrl")) {
    const photoUrl =
      typeof body.photoUrl === "string" ? body.photoUrl.trim() : null;
    if (
      photoUrl === null ||
      (photoUrl !== "" &&
        !validator.isURL(photoUrl, {
          protocols: ["http", "https"],
          require_protocol: true,
        }))
    ) {
      errors.push({
        field: "photoUrl",
        message: "Photo URL must be a valid HTTP or HTTPS URL",
      });
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, "skills")) {
    if (
      !Array.isArray(body.skills) ||
      body.skills.length > 5 ||
      body.skills.some(
        (skill) =>
          typeof skill !== "string" ||
          skill.trim().length === 0 ||
          skill.trim().length > 30,
      )
    ) {
      errors.push({
        field: "skills",
        message:
          "Skills must be an array of up to 5 non-empty strings, each at most 30 characters",
      });
    }
  }

  return errors;
};

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

  return errors.concat(validateCommonUserFields(body));
};

const validateUpdateInput = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return [{ field: "body", message: "Request body must be a JSON object" }];
  }

  const allowedUpdateFields = new Set([
    "age",
    "gender",
    "about",
    "photoUrl",
    "skills",
  ]);

  const errors = Object.keys(body)
    .filter((field) => !allowedUpdateFields.has(field))
    .map((field) => ({ field, message: "This field is not allowed" }));
  errors.push(...validateCommonUserFields(body));

  if (Object.keys(body).length === 0) {
    errors.push({
      field: "body",
      message: "Provide at least one field to update",
    });
  }

  return errors;
};

module.exports = {
  validateSignupInput,
  validateUpdateInput,
};
