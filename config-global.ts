export const APP_NAME_EN = "Smart Insurance Portal";
export const APP_DEFAULT_TITLE_EN = "Smart Insurance Portal";
export const APP_TITLE_TEMPLATE_EN = "%s - Smart Insurance Portal";
export const APP_DESCRIPTION_EN = "Smart Insurance Portal — apply for Health, Home, Car, Life and more through dynamic, schema-driven forms.";

export const APP_NAME_FA = "پورتال هوشمند بیمه";
export const APP_DEFAULT_TITLE_FA = "پورتال هوشمند بیمه";
export const APP_TITLE_TEMPLATE_FA = "%s - پورتال هوشمند بیمه";
export const APP_DESCRIPTION_FA = "پورتال هوشمند بیمه — درخواست بیمه سلامت، خانه، خودرو و زندگی از طریق فرم‌های پویا.";
export const APP_KEYWORDS = ['هوشمند', 'بیمه', 'هوشمند بیمه', 'smart', 'Insurance', 'smart Insurance', 'insurance portal']

// API
// ----------------------------------------------------------------------

export const HOST_API_KEY =
  process.env.NEXT_PUBLIC_HOST_API_KEY ||
  (process.env.NODE_ENV === "production"
    ? ""
    : "https://assignment.devotel.io");
