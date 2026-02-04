import { EventNotFoundException, InvalidPayloadTypeException } from "./exceptions.js";

/**
 * EventBroker is a utility class for managing events, their payloads, and subscribers.
 * It allows you to register events, subscribe to them, and publish payloads to subscribers.
 *
 * Example usage:
 * ```typescript
 * const eventBroker = new EventBroker();
 * const unregister = eventBroker.registerEvent("userCreated", User);
 * eventBroker.subscribe("userCreated", (user) => console.log(user));
 * eventBroker.publish("userCreated", new User());
 * unregister(); // Unregister the event
 * ```
 *
 * @module EventBroker
 * @version 1.0.0
 * @license MIT
 * @author Leonard Atorough
 * @description A TypeScript implementation of an Event Broker pattern that allows registering events with specific payload types, subscribing to events, and publishing events with type safety.
 *
 * @throws {EventNotFoundException} Thrown when trying to subscribe or publish to an unregistered event.
 * @throws {InvalidPayloadTypeException} Thrown when publishing an event with an invalid payload type.
 * @throws {SubscriberNotFoundException} Thrown when trying to unsubscribe a non-existent subscriber.
 *
 * @see {@link EventNotFoundException}
 * @see {@link InvalidPayloadTypeException}
 * @see {@link SubscriberNotFoundException}
 *
 */
class EventBroker {
  private eventSet: Set<string>;
  private eventPayloadMap: Map<string, Set<Object>>;
  private eventSubscriberMap: Map<string, Set<Function>>;

  private static instance: EventBroker;

  private constructor() {
    this.eventSet = new Set<string>();
    this.eventPayloadMap = new Map<string, Set<Object>>();
    this.eventSubscriberMap = new Map<string, Set<Function>>();
  }

  /**
   *
   * Gets the singleton instance of the EventBroker.
   *
   * @returns The singleton instance of the EventBroker.
   */
  public static getInstance(): EventBroker {
    if (!EventBroker.instance) {
      EventBroker.instance = new EventBroker();
    }
    return EventBroker.instance;
  }

  /**
   * Registers an event with a specific payload type.
   *
   * @param eventName - The name of the event.
   * @param payloadType - The constructor of the payload type.
   * @returns A function to unregister the event.
   */
  public registerEvent<T>(eventName: string, payloadType: new () => T): () => void {
    if (!this.eventSet.has(eventName)) {
      this.eventSet.add(eventName);
      this.eventPayloadMap.set(eventName, new Set<Object>([payloadType]));
      this.eventSubscriberMap.set(eventName, new Set<Function>());
    } else {
      const payloadTypes = this.eventPayloadMap.get(eventName);
      payloadTypes?.add(payloadType);
    }

    return () => {
      const registeredPayload = payloadType;
      const payloadTypes = this.eventPayloadMap.get(eventName);
      if (payloadTypes?.has(registeredPayload)) {
        payloadTypes.delete(registeredPayload);
        if (payloadTypes.size === 0) {
          this.eventSet.delete(eventName);
          this.eventPayloadMap.delete(eventName);
          this.eventSubscriberMap.delete(eventName);
        }
      }
    };
  }

  /**
   * Subscribes to an event with a callback function.
   *
   * @param eventName - The name of the event to subscribe to.
   * @param callback - The function to call when the event is published.
   * @returns A function to unsubscribe from the event.
   */
  public subscribe<T>(eventName: string, callback: (payload: T) => void): () => void {
    if (!this.eventSet.has(eventName)) {
      throw new EventNotFoundException(eventName);
    }

    const subscribersSet = this.eventSubscriberMap.get(eventName);
    subscribersSet?.add(callback);

    return () => {
      const registeredCallback = callback;
      const subscribersSet = this.eventSubscriberMap.get(eventName);
      if (subscribersSet?.has(registeredCallback)) {
        subscribersSet.delete(registeredCallback);
      }
    };
  }

  /**
   * Publishes an event with a payload to all subscribers.
   *
   * @param eventName - The name of the event to publish.
   * @param payload - The payload to send to subscribers.
   * @throws {EventNotFoundException} If the event is not registered.
   * @throws {InvalidPayloadTypeException} If the payload type is invalid.
   */
  public publish<T>(eventName: string, payload: T): void {
    if (!this.eventSet.has(eventName)) {
      throw new EventNotFoundException(eventName);
    }

    const payloadTypes = this.eventPayloadMap.get(eventName);
    const isValidPayload = Array.from(payloadTypes || []).some(
      (type) => payload instanceof (type as new () => T),
    );

    if (!isValidPayload) {
      throw new InvalidPayloadTypeException(eventName);
    }

    const subscribersSet = this.eventSubscriberMap.get(eventName);
    subscribersSet?.forEach((callback) => {
      (callback as (payload: T) => void)(payload);
    });
  }

  /**
   * Registers an event asynchronously with a specific payload type.
   *
   * @param eventName - The name of the event to register.
   * @param payloadType - The constructor of the payload type.
   * @returns A promise that resolves to the unregister function.
   */
  public async registerAsync<T>(eventName: string, payloadType: new () => T): Promise<() => void> {
    return new Promise((resolve, reject) => {
      try {
        const unregister = this.registerEvent(eventName, payloadType);
        resolve(unregister);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Lists all registered events.
   *
   * @returns An array of registered event names.
   */
  public listRegisteredEvents(): string[] {
    return Array.from(this.eventSet);
  }

  /**
   * Lists all subscribers for a specific event.
   *
   * @param eventName - The name of the event.
   * @returns An array of subscriber functions.
   * @throws {EventNotFoundException} If the event is not registered.
   */
  public listSubscribers(eventName: string): Function[] {
    if (!this.eventSet.has(eventName)) {
      throw new EventNotFoundException(eventName);
    }
    const subscribersSet = this.eventSubscriberMap.get(eventName);
    return subscribersSet ? Array.from(subscribersSet) : [];
  }

  public listPayloadTypes(eventName: string): Object[] {
    if (!this.eventSet.has(eventName)) {
      throw new EventNotFoundException(eventName);
    }
    const payloadTypes = this.eventPayloadMap.get(eventName);
    return payloadTypes ? Array.from(payloadTypes) : [];
  }
}

export { EventBroker };
