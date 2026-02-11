export function getAppName() {
  return import.meta.env.VITE_APP_NAME || "Restaurant POS";
}

export function getApiUrl() {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/";
}

export function title(pageTitle = "") {
  const name = getAppName(); // avoid name conflict
  if (!pageTitle) return name;
  return `${pageTitle} | ${name}`;
}
