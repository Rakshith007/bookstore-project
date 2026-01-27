import { getToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  registrationDate: string;
  status: "Active" | "Inactive";
}

// Fetch all users
export const fetchUsers = async (): Promise<User[]> => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};

// === NEW: Delete a user by ID ===
export const deleteUser = async (id: string): Promise<void> => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // Optional: Parse the error message from the backend if available
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete user");
  }
};