import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../services/axiosInstance";

interface SettingsContextType {
    storeName: string;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
    storeName: "PrimeHive",
    loading: true,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [storeName, setStoreName] = useState("PrimeHive");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await axiosInstance.get("/settings/public");
                if (data.storeName) {
                    setStoreName(data.storeName);
                }
            } catch {
                // Fallback to default "PrimeHive" on error
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ storeName, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};
