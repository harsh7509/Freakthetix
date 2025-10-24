declare module '@cashfreepayments/cashfree-js' {
  // load() returns a Promise<CashfreeInstance>
  export function load(opts: { mode: 'sandbox' | 'production' }): Promise<CashfreeInstance>;

  // this is the object we use in checkout/page.tsx
  export interface CashfreeInstance {
    checkout(params: {
      paymentSessionId: string;
      redirectTarget?: '_self' | '_blank';
    }): Promise<void>;
  }
}
