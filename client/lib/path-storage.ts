const RETURN_PATHS_KEY = "returnPaths";

export function saveReturnPath(path: string) {
    if (typeof window !== "undefined") {
      try {

        if (!path) return;
        const currentPaths = JSON.parse(sessionStorage.getItem(RETURN_PATHS_KEY) || "[]");
        if (!Array.isArray(currentPaths)) {
            sessionStorage.setItem(RETURN_PATHS_KEY, JSON.stringify([path]));
            return;
        }
        if (currentPaths.includes(path)) return; // Avoid duplicates
        currentPaths.push(path);
        sessionStorage.setItem(RETURN_PATHS_KEY, JSON.stringify(currentPaths));
      }
        catch (error) {
            console.error("Error saving return path:", error);
        }
    }
}

export function getReturnPaths(): string[] {
    if (typeof window !== "undefined") {
        const returnPaths = JSON.parse(sessionStorage.getItem(RETURN_PATHS_KEY) || "[]");
        return returnPaths;
    }
    return [];
}
export function clearReturnPaths() {
    if (typeof window !== "undefined") {
        sessionStorage.removeItem(RETURN_PATHS_KEY);
    }
}

export function getLastReturnPath(): string | null {
    if (typeof window !== "undefined") {
        const returnPaths = JSON.parse(sessionStorage.getItem(RETURN_PATHS_KEY) || "[]");
        if (Array.isArray(returnPaths) && returnPaths.length > 0) {
            return returnPaths[returnPaths.length - 1];
        }
    }
    return null;
}