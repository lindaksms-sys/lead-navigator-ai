// PayPal SDK loader and plan mapping
// Provider-agnostic: all PayPal-specific logic lives here

let loadPromise: Promise<void> | null = null;

export function loadPayPalSDK(clientId: string): Promise<void> {
  if (loadPromise) return loadPromise;

  // Already loaded
  if ((window as any).paypal) return Promise.resolve();

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons&vault=true&intent=subscription`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load PayPal SDK"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
