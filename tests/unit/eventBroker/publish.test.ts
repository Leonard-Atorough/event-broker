import { beforeEach, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  EventBroker,
  EventNotFoundException,
  InvalidPayloadTypeException,
} from "../../../src/index.js";
import { TestPayload } from "./testPayload";

describe("EventBroker - publish", () => {
  beforeEach(() => {
    // Clear the singleton instance before each test
    (EventBroker as any).instance = null;
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

    it("should throw an EventNotFoundException when publishing to an unregistered event", () => {
      const broker = EventBroker.getInstance();
      assert.throws(() => {
        broker.publish("nonExistentEvent", {});
      }, EventNotFoundException);
    });

    it("should throw an InvalidPayloadTypeException when publishing with an invalid payload type", () => {
      const broker = EventBroker.getInstance();
      broker.registerEvent("testEvent", TestPayload);
      assert.throws(() => {
        broker.publish("testEvent", { invalid: "payload" });
      }, InvalidPayloadTypeException);
    });
  });
});