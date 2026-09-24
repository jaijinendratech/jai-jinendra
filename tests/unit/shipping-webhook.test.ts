import { describe, expect, it } from "vitest";
import {
  mapShiprocketToOrderStatus,
  shouldAdvanceOrderStatus,
  webhookEventId,
} from "@/lib/shipping/shiprocket-webhook";

describe("shiprocket webhook mapping", () => {
  it("maps delivered label", () => {
    expect(
      mapShiprocketToOrderStatus({ current_status: "DELIVERED" }),
    ).toBe("delivered");
  });

  it("maps in transit to dispatched", () => {
    expect(
      mapShiprocketToOrderStatus({
        current_status: "IN TRANSIT",
        current_status_id: 20,
      }),
    ).toBe("dispatched");
  });

  it("does not downgrade delivered", () => {
    expect(shouldAdvanceOrderStatus("delivered", "dispatched")).toBe(false);
  });

  it("builds stable event ids", () => {
    expect(
      webhookEventId({
        awb: "1",
        current_status_id: 20,
        current_timestamp: "t",
      }),
    ).toBe("shipping:1:20:t");
  });
});
