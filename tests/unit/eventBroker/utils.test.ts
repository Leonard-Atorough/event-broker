import assert from "assert";
import { describe, it, beforeEach } from "node:test";
import { EventBroker, EventNotFoundException } from "../../../src";
import { TestPayload } from "./testPayload";

describe("listSubscribers", () => {
  beforeEach(() => {
    // Clear the singleton instance before each test
    (EventBroker as any).instance = null;
  });
  it("should list all subscribers for a specific event", () => {
    const broker = EventBroker.getInstance();
    broker.registerEvent("testEvent", TestPayload);
    const callback1 = (payload: any) => {};
    const callback2 = (payload: any) => {};
    broker.subscribe("testEvent", callback1);
    broker.subscribe("testEvent", callback2);
    const subscribers = broker.listSubscribers("testEvent");
    assert.deepEqual(subscribers, [callback1, callback2]);
  });

  it("should return an empty array when listing subscribers for an event with no subscribers", () => {
    const broker = EventBroker.getInstance();
    broker.registerEvent("testEvent", TestPayload);
    const subscribers = broker.listSubscribers("testEvent");
    assert.deepEqual(subscribers, []);
  });

  it("should throw an error when listing subscribers for an unregistered event", () => {
    const broker = EventBroker.getInstance();
    assert.throws(() => {
      broker.listSubscribers("nonExistentEvent");
    }, EventNotFoundException);
  });
});
