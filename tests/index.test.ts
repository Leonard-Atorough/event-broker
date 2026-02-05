import { beforeEach, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { EventBroker, EventNotFoundException } from "../src/index.js";

class TestPayload {
  data: string;
  constructor(data: string) {
    this.data = data;
  }
}

describe("EventBroker", () => {
  beforeEach(() => {
    // Clear the singleton instance before each test
    (EventBroker as any).instance = null;
  });
  describe("registerEvent", () => {
    it("should register an event and return an unregister function", () => {
      const broker = EventBroker.getInstance();
      const unregister = broker.registerEvent("testEvent", class TestPayload {});
      assert.strictEqual(typeof unregister, "function");
      assert.deepEqual(broker.listRegisteredEvents(), ["testEvent"]);
      unregister();
      assert.deepEqual(broker.listRegisteredEvents(), []);
    });

    it("should allow multiple payload types for the same event", () => {
      const broker = EventBroker.getInstance();
      const unregister1 = broker.registerEvent("testEvent", class TestPayload1 {});
      const unregister2 = broker.registerEvent("testEvent", class TestPayload2 {});
      assert.deepEqual(broker.listRegisteredEvents(), ["testEvent"]);
      const payloadTypes = broker.listPayloadTypes("testEvent");
      assert.strictEqual(payloadTypes.length, 2);
      unregister1();
      assert.deepEqual(broker.listRegisteredEvents(), ["testEvent"]);
      unregister2();
      assert.deepEqual(broker.listRegisteredEvents(), []);
    });
  });

  describe("subscribe", () => {
    it("should subscribe to an event and return an unsubscribe function", () => {
      const broker = EventBroker.getInstance();
      broker.registerEvent("testEvent", TestPayload);
      const callback = (payload: any) => {};
      const subscriberId = broker.subscribe("testEvent", callback);
      assert.strictEqual(typeof subscriberId, "string");
      assert.deepEqual(broker.listSubscribers("testEvent"), [callback]);
    });

    it("should unsubscribe a subscriber from an event", () => {
      const broker = EventBroker.getInstance();
      broker.registerEvent("testEvent", TestPayload);
      const callback = (payload: any) => {};
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

  describe("publish", () => {
    it("should publish an event to all subscribers", () => {
      const broker = EventBroker.getInstance();
      broker.registerEvent("testEvent", TestPayload);
      let receivedPayload: any = null;
      broker.subscribe("testEvent", (payload) => {
        receivedPayload = payload;
      });
      const testPayload = new TestPayload("test");
      broker.publish("testEvent", testPayload);
      assert.deepEqual(receivedPayload, testPayload);
    });
  });
});
