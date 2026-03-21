import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../services/axiosInstance";

interface SettingsContextType {
    storeName: string;
    supportEmail: string;
    supportPhone: string;
    storeLocation: string;
    freeShippingThreshold: number;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
    storeName: "PrimeHive",
    supportEmail: "support@primehive.com",
    supportPhone: "+919385598932",
    storeLocation: "123 Tech Park, Bangalore",
    freeShippingThreshold: 999,
    loading: true,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [storeName, setStoreName] = useState("PrimeHive");
    const [supportEmail, setSupportEmail] = useState("support@primehive.com");
    const [supportPhone, setSupportPhone] = useState("+919385598932");
    const [storeLocation, setStoreLocation] = useState("123 Tech Park, Bangalore");
    const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(999);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await axiosInstance.get("/settings/public");
                if (data.storeName) setStoreName(data.storeName);
                if (data.supportEmail) setSupportEmail(data.supportEmail);
                if (data.supportPhone) setSupportPhone(data.supportPhone);
                if (data.storeLocation) setStoreLocation(data.storeLocation);
                if (data.freeShippingThreshold !== undefined) {
                    setFreeShippingThreshold(data.freeShippingThreshold);
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
        <SettingsContext.Provider value={{ storeName, supportEmail, supportPhone, storeLocation, freeShippingThreshold, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};
