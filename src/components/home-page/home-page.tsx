import { NextPage } from "next";
import Link from "next/link";
import { InsuranceForm } from "@/types/insurance";

interface HomeProps {
  insuranceTypes: InsuranceForm[];
}


const BASE_URL = "https://assignment.devotel.io";

export const fetchInsuranceTypes = async (): Promise<InsuranceForm[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/insurance/forms`);
    const data: InsuranceForm[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching insurance types:", error);
    return [];
  }
};

const InsurancePage: NextPage<HomeProps> = async () => {
    const insuranceTypes = await fetchInsuranceTypes()
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Insurance Types</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insuranceTypes.map((insurance) => (
          <Link key={insurance.formId} href={`/insurance/${insurance.formId}`}>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">{insurance.title}</h2>
              <p className="text-gray-600">Click to apply</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};


export default InsurancePage;