declare namespace SegmentProfile {
  interface SegmentData {
    traits?: Record<string, string | number | boolean>;
  }

  interface OrderCompletedEvent {
    products: string;
    amount: number;
    categories: string;
  }

  interface SelectProductEvent {
    product: string;
    categories: string;
  }
}
