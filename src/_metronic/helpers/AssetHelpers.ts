import { useLayout } from "../layout/core";
import { ThemeModeComponent } from "../assets/ts/layout";

export const toAbsoluteUrl = (pathname: string) => {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const baseNoSlash = normalizedBase.replace(/^\//, "");
  const normalizedPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;

  // If pathname already includes the base prefix, don't prepend it again
  if (normalizedPath.startsWith(baseNoSlash)) {
    return `/${normalizedPath}`.replace(/\/{2,}/g, "/");
  }

  return `${normalizedBase}${normalizedPath}`.replace(/\/{2,}/g, "/");
};

export const useIllustrationsPath = (illustrationName: string): string => {
  const { config } = useLayout();

  const extension = illustrationName.substring(
    illustrationName.lastIndexOf("."),
    illustrationName.length
  );
  const illustration =
    ThemeModeComponent.getMode() === "dark"
      ? `${illustrationName.substring(
          0,
          illustrationName.lastIndexOf(".")
        )}-dark`
      : illustrationName.substring(0, illustrationName.lastIndexOf("."));
  return toAbsoluteUrl(
    `media/illustrations/${config.illustrations?.set}/${illustration}${extension}`
  );
};
