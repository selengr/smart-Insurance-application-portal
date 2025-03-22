import { useQuery } from '@tanstack/react-query';
import { purchasedInsurancesApi } from '@/services/api/purchased-insurances';


export const useFetchusePurchasedInsurances = () => {
    return useQuery({
      queryKey: ["purchased-insurances"],
      queryFn: () => purchasedInsurancesApi(),
      retry: 3,
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    });
  };

