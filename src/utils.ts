import { UserModel } from "@/components/Users/models";

export const formatUsername = (user: UserModel) => {
  return (
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.username ||
    "Unknown User"
  );
};
