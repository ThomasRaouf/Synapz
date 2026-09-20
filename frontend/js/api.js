const API_BASE_URL = "http://127.0.0.1:8000";
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;
    if (!response.ok) {
      let errorMessage = "We couldn't process this material, please try again.";
      if (!isJson || response.status >= 500) {
        errorMessage = "Backend unavailable, please try again.";
      } else if (data && data.detail) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        }
        else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map(err => err.msg).join(', ');
        }
      }
      throw new Error(errorMessage);

    }
    return data;
  }
  catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error("Backend unavailable, please try again.");
    }
    throw error;
  }
}

async function uploadMaterialRequest(formData) {
  return await apiRequest('/api/materials', {
    method: 'POST',
    body: formData,
  });
}