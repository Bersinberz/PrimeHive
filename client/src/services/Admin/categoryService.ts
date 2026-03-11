import axiosInstance from "../axiosInstance";

// Types
export interface Category {
    _id: string;
    name: string;
    description: string;
    productCount: number;
    createdAt: string;
}

export interface CreateCategoryPayload {
    name: string;
    description: string;
}

export interface CategoryProduct {
    _id: string;
    name: string;
    sku: string;
    images: string[];
}

// Create category
export const createCategory = async (
    payload: CreateCategoryPayload
): Promise<Category> => {
    const response = await axiosInstance.post("admin/categories/create", payload);
    return response.data;
};

// Get all categories (paginated)
export const getCategories = async (params?: { page?: number; limit?: number; search?: string }): Promise<Category[]> => {
    const response = await axiosInstance.get("admin/categories/get", { params });
    return response.data.data;
};

// Delete category
export const deleteCategory = async (id: string): Promise<void> => {
    await axiosInstance.delete(`admin/categories/delete/${id}`);
};

// Get products assigned to a category
export const getCategoryProducts = async (
    categoryId: string
): Promise<CategoryProduct[]> => {
    const response = await axiosInstance.get(
        `admin/categories/${categoryId}/products`
    );
    return response.data;
};

// Assign products to a category
export const assignProducts = async (
    categoryId: string,
    productIds: string[]
): Promise<{ message: string; productCount: number }> => {
    const response = await axiosInstance.put(
        `admin/categories/${categoryId}/products`,
        { productIds }
    );
    return response.data;
};

export const updateCategory = async (
    id: string,
    payload: Partial<CreateCategoryPayload>
): Promise<Category> => {
    const response = await axiosInstance.put(`admin/categories/update/${id}`, payload);
    return response.data;
};