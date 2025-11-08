import { PlaywrightRunnerTarget } from "./types";

const sanitizePath = (path: string): string => {
  return path.replace(/^\/+|\/+$/g, "").replace(/\//g, "_");
};

// e.g.
// - "/" -> "index-1200.png"
// - "/articles/" -> "articles-1200.png"
// - "/articles/category/page/" -> "articles_category_page-1200.png"
export const getFileName = (target: PlaywrightRunnerTarget): string => {
  const sanitizedPath = target.path === "/" ? "index" : sanitizePath(target.path);

  return `${sanitizedPath}-${target.width}.png`;
};
