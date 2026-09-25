const API_BASE_URL = window.SYNAPZ_API_URL || "http://127.0.0.1:8000";

async function apiRequest(endpoint, options = {}) {
  try {

    const session = typeof getCurrentSession === 'function' ? await getCurrentSession() : null;

    if (session?.access_token) {
      options.headers = options.headers || {};

      if (!options.headers['Authorization']) {
        options.headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      if (response.status === 401) {

        if (typeof signOutUser === 'function') {
          await signOutUser();
        }
        window.location.href = "login.html";
        throw new Error("Your session has expired. Please log in again.")
      }
      
      let errorMessage = "We couldn't process this material, please try again.";
      if (data && data.detail) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map(err => err.msg).join(', ');
        }
      }
      throw new Error(errorMessage);

    }
    return data;
  }
  catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Backend unavailable, please check your connection');
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

async function fetchMaterials () {
  return await apiRequest("/api/materials");

}

async function fetchMaterial(id) {
  return await apiRequest(`/api/materials/${id}`);

}

async function processMaterial(id) {
  return await apiRequest(`/api/materials/${id}/process`, {
    method: "POST"
  });

}

async function generateSummary(id) {
  return await apiRequest(`/api/materials/${id}/summary`, {
    method: "POST"
  });

}

async function fetchSummary(id) {
  return await apiRequest(`/api/materials/${id}/summary`);

}