export const PRODUCT_VISUAL: Record<string, { src: string; alt: string }> = {
  health_insurance_application: {
    src: "/images/product-health.jpg",
    alt: "Health insurance",
  },
  home_insurance_application: {
    src: "/images/product-home.jpg",
    alt: "Home insurance",
  },
  car_insurance_application: {
    src: "/images/product-car.jpg",
    alt: "Car insurance",
  },
  life_insurance_application: {
    src: "/images/product-life.jpg",
    alt: "Life insurance",
  },
}

export function productTitle(raw: string) {
  return raw.replace(/\s+Application$/i, "").trim()
}
