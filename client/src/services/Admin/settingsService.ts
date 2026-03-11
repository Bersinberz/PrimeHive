import axiosInstance from "../axiosInstance";

export interface StoreSettings {
    _id: string;
    storeName: string;
    supportEmail: string;
    currency: string;
    timezone: string;
    orderIdPrefix: string;
    standardShippingRate: number;
    freeShippingThreshold: number;
    taxRate: number;
    taxInclusive: boolean;
}

export const getSettings = async (): Promise<StoreSettings> => {
    const { data } = await axiosInstance.get("/admin/settings/get");
    return data;
};

export const updateSettings = async (
    payload: Partial<Omit<StoreSettings, "_id">>
): Promise<StoreSettings> => {
    const { data } = await axiosInstance.put("/admin/settings/update", payload);
    return data;
};

export const changePassword = async (
    currentPassword: string,
    newPassword: string
): Promise<void> => {
    await axiosInstance.put("/admin/settings/change-password", {
        currentPassword,
        newPassword,
    });
};
