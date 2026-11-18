"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CompanyRole, Role, User, UserStatus } from "@/types/user";
import { UsersService } from "@/api/userApi";
import { clientAuthProvider } from "@/lib/authProvider";

type AuthContextType = {
    user: User | null;
    role: Role | null;
    status: UserStatus | null;
    companyRole: CompanyRole | null;
    /** True until the first /identity request has finished */
    isLoading: boolean;
    setUser: (u: User | null) => void;
    /** Reload the session from /identity (e.g. after editing the profile) */
    refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadCurrentUser(): Promise<User | null> {
    try {
        return await new UsersService(clientAuthProvider()).getCurrentUser();
    } catch {
        // Invalid or expired credentials behave as logged out
        return null;
    }
}

export function AuthProvider({ children, }: Readonly<{ children: React.ReactNode; }>) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        setUser(await loadCurrentUser());
    }, []);

    useEffect(() => {
        let mounted = true;
        loadCurrentUser().then((u) => {
            if (!mounted) return;
            setUser(u);
            setIsLoading(false);
        });
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                role: user?.role ?? null,
                status: user?.status ?? null,
                companyRole: user?.companyRole ?? null,
                isLoading,
                setUser,
                refresh,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be inside AuthProvider");
    return ctx;
}
