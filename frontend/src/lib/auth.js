export const useAuth = () => {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("auth_user");
    const user = userStr ? JSON.parse(userStr) : null;
    const logout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
    };
    const setAuth = (token, user) => {
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_user", JSON.stringify(user));
    };
    return {
        token,
        user,
        isLoggedIn: !!token,
        logout,
        setAuth,
    };
};
export const isAdmin = () => {
    const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
    return user.role === "ADMIN";
};
export const isAgent = () => {
    const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
    return user.role === "AGENT";
};
