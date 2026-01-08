// Prefer environment override so deployments (e.g., Vercel) don't hardcode localhost.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");

export async function getHealth(signal) {
  const res = await fetch(`${BASE_URL}/health`, { signal });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
