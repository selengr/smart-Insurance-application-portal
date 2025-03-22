import { NextPage } from "next";
import Link from "next/link";
import { InsuranceForm } from "@/types/insurance";
import { Locale } from "../../../i18n.config";
import { getDictionary } from "@/lib/dictionary";
import { fetchInsuranceTypes } from "@/services/api/home";

interface HomeProps {
  insuranceTypes: InsuranceForm[];
  lang : Locale
}

const InsurancePage: NextPage<HomeProps> = async ({lang}) => {
    const insuranceTypes = await fetchInsuranceTypes()
    const { page } = await getDictionary(lang)
    
  return (
    <div className="min-h-screen bg-gradient-to-r p-8 bg-[rgb(2 2 30 / 1)]">
    <h1 className="text-4xl font-bold mb-8 text-center ">{page.home.title}</h1>
    <h2 className="text-2xl font-semibold mb-8 text-center">{page.home.InsuranceTypes}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {insuranceTypes.data.map((insurance) => (
        <Link key={insurance.formId} href={`/${lang}/insurance/${insurance.formId}`}>
          <div className="p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-100">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 0v1m0-1H9m3 0h3m-3 0H9m3 0h3m-3 0v1m0-1V7m0 1v1m0 0v1m0-1H9m3 0h3m-3 0H9"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center ">{insurance.title}</h2>
            <p className="text-center">{page.home.InsuranceLink}</p>
          </div>
        </Link>
      ))}
    </div>

    <div className="mt-10">
    
    <Link  href={`/${lang}/purchased-insurances`}>
          <div className="p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer transform border border-gray-100">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 0v1m0-1H9m3 0h3m-3 0H9m3 0h3m-3 0v1m0-1V7m0 1v1m0 0v1m0-1H9m3 0h3m-3 0H9"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center ">{page.home.myInsurance}</h2>
          </div>
        </Link>
    </div>
  </div>
  );
};


export default InsurancePage;