import * as yup from "yup";

export const profileSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Email is required"),
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores"
    ),
  bio: yup.string().max(200, "Bio must be less than 200 characters"),
  jobTitle: yup.string(),
  company: yup.string(),
  location: yup.string(),
  website: yup.string().url("Please enter a valid URL").nullable(),
  avatarUrl: yup.string(),
});
