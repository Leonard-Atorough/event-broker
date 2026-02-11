import { beforeEach, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  EventBroker,
  EventNotFoundException,
  SubscriberNotFoundException,
} from "../../../src/index.js";
import { TestPayload } from "./testPayload.js";

describe("EventBroker - unsubscribe", () => {
  beforeEach(() => {
    // Clear the singleton instance before each test
    (EventBroker as any).instance = null;
  });

  describe("unsubscribe", () => {
    it("should throw an EventNotFoundException when unsubscribing from an unregistered event", () => {
      const broker = EventBroker.getInstance();
      assert.throws(() => {
        broker.unsubscribe("nonExistentEvent", "someSubscriberId");
      }, EventNotFoundException);
    });

    it("should throw a SubscriberNotFoundException when unsubscribing a non-existent subscriber", () => {
      const broker = EventBroker.getInstance();
      broker.registerEvent("testEvent", TestPayload);
      assert.throws(() => {
        broker.unsubscribe("testEvent", "nonExistentSubscriberId");
      }, SubscriberNotFoundException);
    });
  });
});