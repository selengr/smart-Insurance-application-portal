export const PRODUCT_IMAGE_SRC: Record<string, string> = {
  health_insurance_application: "/images/product-health.jpg",
  home_insurance_application: "/images/product-home.jpg",
  car_insurance_application: "/images/product-car.jpg",
  life_insurance_application: "/images/product-life.jpg",
}

const FALLBACK_SRC = "/images/product-home.jpg"

/** Localized alt should be passed from productTitles when available. */
export function productVisual(formId: string, alt?: string) {
  return {
    src: PRODUCT_IMAGE_SRC[formId] ?? FALLBACK_SRC,
    alt: alt?.trim() || formId.replace(/_/g, " "),
  }
}

/** @deprecated Prefer productVisual(formId, localizedAlt) */
export const PRODUCT_VISUAL: Record<string, { src: string; alt: string }> =
  Object.fromEntries(
    Object.entries(PRODUCT_IMAGE_SRC).map(([id, src]) => [
      id,
      { src, alt: id.replace(/_/g, " ") },
    ]),
  )

export function productTitle(raw: string) {
  return raw.replace(/\s+Application$/i, "").trim()
}
