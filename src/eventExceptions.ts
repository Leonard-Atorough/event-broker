/**
 * Custom exception thrown when an event is not found.
 * @class
 * @extends Error
 *
 * @property {string} name - The name of the exception.
 */
class EventNotFoundException extends Error {
  constructor(eventName: string) {
    super(`Event "${eventName}" is not registered.`);
    this.name = "EventNotFoundException";
  }
}

/**
 * Custom exception thrown when an invalid payload type is provided for an event.
 * @class
 * @extends Error
 *
 * @property {string} name - The name of the exception.
 */
class InvalidPayloadTypeException extends Error {
  constructor(eventName: string) {
    super(`Invalid payload type for event "${eventName}".`);
    this.name = "InvalidPayloadTypeException";
  }
}
/**
 * Custom exception thrown when a subscriber is not found.
 * @class
 * @extends Error
 *
 * @property {string} name - The name of the exception.
 */
class SubscriberNotFoundException extends Error {
  constructor(eventName: string, subscriberId: string) {
    super(`Subscriber with ID "${subscriberId}" not found for event "${eventName}".`);
    this.name = "SubscriberNotFoundException";
  }
}
export { EventNotFoundException, InvalidPayloadTypeException, SubscriberNotFoundException };
