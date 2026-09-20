export function formatMonthlyEstimate(
  amount: number,
  lang: string,
  suffixes: { perMonth: string; toman: string },
) {
  if (lang === "fa") {
    return `${amount.toLocaleString("fa-IR")} ${suffixes.toman}`
  }
  return `$${amount.toLocaleString("en-US")}${suffixes.perMonth}`
}

export function formatLiveQuote(
  amount: number,
  lang: string,
  suffixes: { toman: string },
) {
  if (lang === "fa") {
    return `${amount.toLocaleString("fa-IR")} ${suffixes.toman}`
  }
  return `$${amount.toLocaleString("en-US")}`
}
