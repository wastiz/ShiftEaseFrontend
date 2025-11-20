export const authKeys = {
    all: ["auth"] as const,
    currentUser: () => [...authKeys.all, "currentUser"] as const,
    user: (userId: number) => [...authKeys.all, "user", userId] as const,
};
