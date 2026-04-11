import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PayPalConfig {
  client_id: string;
  plans: Record<string, string>;
}

export function usePayPalConfig() {
  return useQuery<PayPalConfig>({
    queryKey: ["paypal-config"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("paypal-config");
      if (error) throw error;
      return data as PayPalConfig;
    },
    staleTime: 10 * 60 * 1000,
  });
}
