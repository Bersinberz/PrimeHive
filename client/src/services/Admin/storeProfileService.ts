import axiosInstance from "../axiosInstance";

export interface StoreProfile {
    storeName: string;
    storeDescription: string;
    storeLocation: string;
    storePhone: string;
}

export const getStoreProfile = async (): Promise<StoreProfile> => {
    const { data } = await axiosInstance.get("/admin/store-profile");
    return data;
};

export const updateStoreProfile = async (payload: Partial<StoreProfile>): Promise<StoreProfile> => {
    const { data } = await axiosInstance.put("/admin/store-profile", payload);
    return data;
};
