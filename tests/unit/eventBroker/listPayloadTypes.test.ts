import { beforeEach, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  EventBroker,
  EventNotFoundException,
} from "../../../src/index.js";

describe("EventBroker - listPayloadTypes", () => {
  beforeEach(() => {
    // Clear the singleton instance before each test
    (EventBroker as any).instance = null;
  });

  describe("listPayloadTypes", () => {
    it("should list all payload types for a specific event", () => {
      const broker = EventBroker.getInstance();
      broker.registerEvent("testEvent", class PayloadType1 {});
      broker.registerEvent("testEvent", class PayloadType2 {});
      const payloadTypes = broker.listPayloadTypes("testEvent");
      assert.strictEqual(payloadTypes.length, 2);
    });

    it("should throw an EventNotFoundException when listing payload types for an unregistered event", () => {
      const broker = EventBroker.getInstance();
      assert.throws(() => {
        broker.listPayloadTypes("nonExistentEvent");
      }, EventNotFoundException);
    });
  });
});