import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback
} from "react";
import {
    loginUser,
    signupUser,
    refreshSession,
    logoutUser
} from "../services/authService";
import type { SignupData, AuthUser } from "../services/authService";
import { setAccessToken, clearAccessToken } from "../utils/tokenService";

// ==========================================
// Types
// ==========================================

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<AuthUser>;
    signup: (data: SignupData) => Promise<AuthUser>;
    logout: () => Promise<void>;
}

// ==========================================
// Context
// ==========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// ==========================================
// Provider
// ==========================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore session on app mount via refresh token cookie
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const data = await refreshSession();
                setAccessToken(data.token);
                setUser(data.user);
            } catch {
                clearAccessToken();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = useCallback(
        async (email: string, password: string): Promise<AuthUser> => {
            const data = await loginUser({ email, password });
            setAccessToken(data.token);
            setUser(data.user);
            return data.user;
        },
        []
    );

    const signup = useCallback(async (signupData: SignupData): Promise<AuthUser> => {
        const data = await signupUser(signupData);
        setAccessToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(async () => {
        try {
            await logoutUser();
        } catch {
            // Clear locally even if server call fails
        }
        clearAccessToken();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                loading,
                login,
                signup,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
