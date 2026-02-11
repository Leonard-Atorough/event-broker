import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import {
  EventNotFoundException,
  InvalidPayloadTypeException,
  SubscriberNotFoundException,
} from "../../../src/index.js";

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
    const exception = new SubscriberNotFoundException("testEvent", "subscriber123");
    assert.strictEqual(exception.name, "SubscriberNotFoundException");
    assert.strictEqual(exception.message, 'Subscriber with ID "subscriber123" not found for event "testEvent".');
  });
});