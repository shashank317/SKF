// src/services/api.js

// Default to localhost:8000 for local development if env var is missing
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

console.log("🔌 Connecting to API:", API_BASE_URL);

/**
 * Generic fetch wrapper to handle JSON responses and errors
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) errorMessage = errorData.detail;
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errorMessage);
  }

  // Return null for 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

// --- Health Check ---
export async function getHealth() {
  // Note: health is at root /health, not /api/v1/health usually, 
  // but let's check how main.py is set up.
  // main.py has: @app.get("/health") -> so it's at http://localhost:8000/health
  // But our API_BASE_URL includes /api/v1.
  // So we handle health separately or adjust base url.

  // Quick fix: use absolute URL for health if needed, or assume it's under api/v1 if we moved it.
  // Current main.py: @app.get("/health") is at root level.
  const rootUrl = API_BASE_URL.replace("/api/v1", "");
  const response = await fetch(`${rootUrl}/health`);
  return response.json();
}

// --- Configurations ---

export async function createConfiguration(data) {
  return request("/configurations/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getConfigurations(skip = 0, limit = 20) {
  return request(`/configurations/?skip=${skip}&limit=${limit}`);
}

export async function getConfiguration(id) {
  return request(`/configurations/${id}`);
}

export async function updateConfiguration(id, data) {
  return request(`/configurations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteConfiguration(id) {
  return request(`/configurations/${id}`, {
    method: "DELETE",
  });
}

// --- Exports ---

export async function createExport(data) {
  return request("/exports/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getExport(id) {
  return request(`/exports/${id}`);
}

export async function getExportsByConfiguration(configId) {
  return request(`/exports/configuration/${configId}`);
}

// --- Custom Model Generation (Roller Support) ---

export async function generateCustomModel(data) {
  // This endpoint is at /api/generate-cad (not under /api/v1)
  const rootUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").replace("/api/v1", "");
  const url = `${rootUrl}/api/generate-cad`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) errorMessage = errorData.detail;
    } catch {
      // Ignore JSON parse error on binary response
    }
    throw new Error(errorMessage);
  }

  // Response is binary — create a Blob URL and capture format
  const contentType = response.headers.get("content-type") || "";
  const format = contentType.includes("stl") ? "stl" : "gltf";
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  return { url: blobUrl, format };
}

// --- Custom Model Generation (T-Bolt) ---

export async function generateTBoltModel(data) {
  const rootUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").replace("/api/v1", "");
  const url = `${rootUrl}/api/generate-tbolt`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) errorMessage = errorData.detail;
    } catch {
      // Ignore JSON parse error on binary response
    }
    throw new Error(errorMessage);
  }

  // Response is binary — create a Blob URL
  const contentType = response.headers.get("content-type") || "";
  const format = contentType.includes("stl") ? "stl" : "gltf";
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  return { url: blobUrl, format };
}

// --- Download Latest CAD Files (ZIP) ---

export async function downloadLatestCadFiles(fileNum = null) {
  const rootUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").replace("/api/v1", "");
  let url = `${rootUrl}/api/download-latest-cad`;
  if (fileNum !== null) {
    url += `?file_num=${fileNum}`;
  }

  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) errorMessage = errorData.detail;
    } catch {
      // Ignore JSON parse error on binary response
    }
    throw new Error(errorMessage);
  }

  // Response is a ZIP file — trigger download
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  
  // Get filename from Content-Disposition header or use default
  const contentDisposition = response.headers.get("content-disposition") || "";
  const filenameMatch = contentDisposition.match(/filename=([^;]+)/);
  const filename = filenameMatch ? filenameMatch[1] : "cad_files.zip";
  
  // Create download link and trigger
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Cleanup
  URL.revokeObjectURL(blobUrl);
  
  return { success: true, filename };
}
