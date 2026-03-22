import { Request } from "express";

export const permitRoutes = (
  req: Request,
  method: string,
  ...routes: string[]
): boolean => {
  const requestMethod = (req.method || "").toUpperCase();
  const expectedMethod = (method || "").toUpperCase();

  return routes.some((entry) => {
    const trimmed = entry.trim();
    const parts = trimmed.split(/\s+/);

    if (parts.length === 1) {
      if (expectedMethod && requestMethod !== expectedMethod) {
        return false;
      }

      if (parts[0].endsWith("*")) {
        return req.path.startsWith(parts[0].slice(0, -1));
      }
      return parts[0] === req.path;
    }

    const entryMethod = parts[0].toUpperCase();
    const entryPath = parts.slice(1).join(" ");

    if (entryPath.endsWith("*")) {
      return (
        entryMethod === requestMethod &&
        req.path.startsWith(entryPath.slice(0, -1))
      );
    }

    return entryMethod === requestMethod && entryPath === req.path;
  });
};
