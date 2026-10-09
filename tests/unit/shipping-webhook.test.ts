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

describe("ready_to_ship ordering", () => {
  it("advances confirmed and COD orders to ready_to_ship", () => {
    expect(shouldAdvanceOrderStatus("confirmed", "ready_to_ship")).toBe(true);
    expect(shouldAdvanceOrderStatus("cod_confirmed", "ready_to_ship")).toBe(true);
  });

  it("lets a picked-up parcel move on to dispatched", () => {
    expect(shouldAdvanceOrderStatus("ready_to_ship", "dispatched")).toBe(true);
  });

  it("never downgrades dispatched back to ready_to_ship", () => {
    expect(shouldAdvanceOrderStatus("dispatched", "ready_to_ship")).toBe(false);
  });
});
