import { beforeEach, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  EventBroker,
  EventNotFoundException,
} from "../../../src/index.js";
import { TestPayload } from "./testPayload.js";

describe("EventBroker - subscribe", () => {
  beforeEach(() => {
    // Clear the singleton instance before each test
    (EventBroker as any).instance = null;
  });

  describe("subscribe", () => {
    it("should subscribe to an event and return an unsubscribe function", () => {
      const broker = EventBroker.getInstance();
      broker.registerEvent("testEvent", TestPayload);
      const callback = (payload: TestPayload) => {};
      const subscriberId = broker.subscribe("testEvent", callback);
      assert.strictEqual(typeof subscriberId, "string");
      assert.deepEqual(broker.listSubscribers("testEvent"), [callback]);
    });

    it("should unsubscribe a subscriber from an event", () => {
      const broker = EventBroker.getInstance();
      broker.registerEvent("testEvent", TestPayload);
      const callback = (payload: TestPayload) => {};
      const subscriberId = broker.subscribe("testEvent", callback);
      const result = broker.unsubscribe("testEvent", subscriberId);
      assert.strictEqual(result, true);
      assert.deepEqual(broker.listSubscribers("testEvent"), []);
    });

    it("should throw an error when subscribing to an unregistered event", () => {
      const broker = EventBroker.getInstance();
      assert.throws(() => {
        broker.subscribe("nonExistentEvent", () => {});
      }, EventNotFoundException);
    });
  });
});