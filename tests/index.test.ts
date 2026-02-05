import { beforeEach, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  EventBroker,
  EventNotFoundException,
  SubscriberNotFoundException,
  InvalidPayloadTypeException,
} from "../src/index.js";

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

  describe("listRegisteredEvents", () => {
    it("should list all registered events", () => {
      const broker = EventBroker.getInstance();
      broker.registerEvent("event1", TestPayload);
      broker.registerEvent("event2", TestPayload);
      const events = broker.listRegisteredEvents();
      assert.deepEqual(events.sort(), ["event1", "event2"]);
    });
  });

  describe("listSubscribers", () => {
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

    it("should throw an EventNotFoundException when listing subscribers for an unregistered event", () => {
      const broker = EventBroker.getInstance();
      assert.throws(() => {
        broker.listSubscribers("nonExistentEvent");
      }, EventNotFoundException);
    });
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

describe("Exceptions", () => {
  it("EventNotFoundException should have correct name and message", () => {
    const exception = new EventNotFoundException("testEvent");
    assert.strictEqual(exception.name, "EventNotFoundException");
    assert.strictEqual(exception.message, 'Event "testEvent" is not registered.');
  });
  it("InvalidPayloadTypeException should have correct name and message", () => {
    const exception = new InvalidPayloadTypeException("testEvent");
    assert.strictEqual(exception.name, "InvalidPayloadTypeException");
    assert.strictEqual(exception.message, 'Invalid payload type for event "testEvent".');
  });
  it("SubscriberNotFoundException should have correct name and message", () => {
    const exception = new SubscriberNotFoundException();
    assert.strictEqual(exception.name, "SubscriberNotFoundException");
    assert.strictEqual(exception.message, "Subscriber not found.");
  });
});
