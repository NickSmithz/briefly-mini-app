const backendModeKey = "briefly-backend-mode";

export function getBackendModeEnabled() {
  return localStorage.getItem(backendModeKey) === "true";
}

export function setBackendModeEnabled(value: boolean) {
  localStorage.setItem(backendModeKey, String(value));
}

export function isBackendModeAvailable() {
  return true;
}
