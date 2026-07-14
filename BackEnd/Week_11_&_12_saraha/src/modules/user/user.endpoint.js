import { userRoles } from "../../middleware/auth.middleware.js";

export const endpoint = () => {
    profile: [userRoles.user, userRoles.admin]
}