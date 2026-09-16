import { useQuery } from '@tanstack/react-query';
import { purchasedInsurancesApi } from '@/services/api/purchased-insurances';

export const useFetchPurchasedInsurances = () => {
  return useQuery({
    queryKey: ["purchased-insurances"],
    queryFn: () => purchasedInsurancesApi(),
    retry: 3,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

/** @deprecated Use useFetchPurchasedInsurances */
export const useFetchusePurchasedInsurances = useFetchPurchasedInsurances;
