// frontend/src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'; // Fixed: Use port 4000 (your NestJS backend)

export const uploadBook = async (formData: FormData, token: string) => {
  const response = await fetch(`${API_BASE_URL}/books`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set 'Content-Type' here — let the browser set it automatically with the correct boundary for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Unknown error';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If response is not JSON
    }
    throw new Error(errorMessage || 'Failed to add book');
  }

  return await response.json();
};