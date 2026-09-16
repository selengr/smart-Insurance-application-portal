import { NextPage } from "next";
import Link from "next/link";
import { Locale } from "../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";
import { fetchInsuranceTypes } from "@/services/api/home";
import { Button } from "@/components/ui/button";
import { Shield, FolderOpen } from "lucide-react";

interface HomeProps {
  lang: Locale;
}

const InsurancePage: NextPage<HomeProps> = async ({ lang }) => {
  const insuranceTypes = await fetchInsuranceTypes();
  const { page } = await getDictionary(lang);
  const items = insuranceTypes?.data ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-10 text-center sm:mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {page.home.title}
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          {page.home.InsuranceTypes}
        </p>
      </header>

      {items.length === 0 ? (
        <div
          className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground"
          role="status"
        >
          No insurance products available right now.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((insurance) => (
            <li key={insurance.formId}>
              <Link
                href={`/${lang}/insurance/${insurance.formId}`}
                className="group flex h-full flex-col rounded-2xl border border-border/60 bg-background/40 p-6 transition hover:border-primary/40 hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`${page.home.InsuranceLink}: ${insurance.title}`}
              >
                <div className="mb-4 flex justify-center text-primary">
                  <Shield className="h-10 w-10" aria-hidden />
                </div>
                <h2 className="mb-4 text-center text-xl font-semibold">
                  {insurance.title}
                </h2>
                <Button
                  variant="ghost"
                  className="mt-auto w-full justify-center rounded-xl border border-border/50 group-hover:-translate-y-0.5 transition"
                  tabIndex={-1}
                >
                  <span>{page.home.InsuranceLink}</span>
                  <span className="ml-2 transition group-hover:translate-x-1" aria-hidden>
                    →
                  </span>
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 sm:mt-10">
        <Link
          href={`/${lang}/purchased-insurances`}
          className="flex items-center justify-center gap-3 rounded-2xl border border-border/60 bg-background/40 p-6 transition hover:border-primary/40 hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={page.home.myInsurance}
        >
          <FolderOpen className="h-8 w-8 text-primary" aria-hidden />
          <span className="text-xl font-semibold">{page.home.myInsurance}</span>
        </Link>
      </div>
    </div>
  );
};

export default InsurancePage;
