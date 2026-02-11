import { beforeEach, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  EventBroker,
  EventNotFoundException,
} from "../../../src/index.js";
import { TestPayload } from "./testPayload";

describe("EventBroker - getEventHistory", () => {
  beforeEach(() => {
    // Clear the singleton instance before each test
    (EventBroker as any).instance = null;
  });

  describe("getEventHistory", () => {
    it("should return event history for a specific event", () => {
      const broker = EventBroker.getInstance();
      broker.registerEvent("testEvent", TestPayload);
      const testPayload = new TestPayload("test");
      broker.publish("testEvent", testPayload);
      const history = broker.getEventHistory("testEvent");
      assert.strictEqual(history.size, 1);
      const eventHistory = history.get("testEvent");
      assert.strictEqual(eventHistory?.length, 1);
      assert.deepEqual(eventHistory?.[0].payload, testPayload);
    });

    it("should return event history for all events when no event name is provided", () => {
      const broker = EventBroker.getInstance();
      broker.registerEvent("event1", TestPayload);
      broker.registerEvent("event2", TestPayload);
      const payload1 = new TestPayload("payload1");
      const payload2 = new TestPayload("payload2");
      broker.publish("event1", payload1);
      broker.publish("event2", payload2);
      const history = broker.getEventHistory();
      assert.strictEqual(history.size, 2);
      assert.deepEqual(history.get("event1")?.[0].payload, payload1);
      assert.deepEqual(history.get("event2")?.[0].payload, payload2);
    });

    it("should throw an EventNotFoundException when getting history for an unregistered event", () => {
      const broker = EventBroker.getInstance();
      assert.throws(() => {
        broker.getEventHistory("nonExistentEvent");
      }, EventNotFoundException);
    });
  });
});