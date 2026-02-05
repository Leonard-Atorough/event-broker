import {
  EventNotFoundException,
  InvalidPayloadTypeException,
  SubscriberNotFoundException,
} from "./eventExceptions.js";

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
 * @implements {EventBrokerInterface}
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
class EventBroker implements EventBrokerInterface {
  /** Set of registered event names. Provides O(1) average time complexity for lookups. */
  private eventSet: Set<string>;
  /** Maps event names to their associated payload types. */
  private eventPayloadMap: Record<string, Set<Object>>;
  /** Maps event names to their subscribers, where each subscriber has a unique ID and a callback function. */
  private eventSubscriberMap: Record<string, Map<string, Function>>;

  /** In-memory history of events with their payloads and timestamps. Flushed periodically into a persistent storage container. */
  private inMemoryEventHistory: Record<
    string,
    Array<{ payload: any; timestamp: Date; durationMs?: number }>
  > = {};

  /** Counter for generating unique subscriber IDs. */
  private subscriberIdCounter: number = 0;
  /** Singleton instance of the EventBroker. */
  private static instance: EventBroker;

  private constructor() {
    this.eventSet = new Set<string>();
    this.eventPayloadMap = {};
    this.eventSubscriberMap = {};
    this.inMemoryEventHistory = {};
  }

  /**
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

  private generateNextSubscriberId(): string {
    return `subscriber_${++this.subscriberIdCounter}`;
    // preincrement to ensure the first subscriber gets ID "subscriber_1"
  }

  /**
   * Registers an event with a specific payload type.
   *
   * @param eventName - The name of the event.
   * @param payloadType - The constructor of the payload type.
   * @returns A function to unregister the event.
   */
  public registerEvent<T>(eventName: string, payloadType: new (...args: any[]) => T): () => void {
    if (!this.eventSet.has(eventName)) {
      this.eventSet.add(eventName);
      this.eventPayloadMap[eventName] = new Set<Object>([payloadType]);
      this.eventSubscriberMap[eventName] = new Map<string, Function>();
    } else {
      const payloadTypes = this.eventPayloadMap[eventName];
      payloadTypes?.add(payloadType);
    }

    return () => {
      const payloadTypes = this.eventPayloadMap[eventName];
      if (payloadTypes?.has(payloadType)) {
        payloadTypes.delete(payloadType);
        if (payloadTypes.size === 0) {
          this.eventSet.delete(eventName);
          delete this.eventPayloadMap[eventName];
          delete this.eventSubscriberMap[eventName];
        }
      }
    };
  }

  /**
   * Subscribes to an event with a callback function.
   *
   * @param eventName - The name of the event to subscribe to.
   * @param onEventReceived - The function to call when the event is published.
   * @returns The subscriber ID.
   */
  public subscribe<T>(eventName: string, onEventReceived: (payload: T) => void): string {
    if (!this.eventSet.has(eventName)) {
      throw new EventNotFoundException(eventName);
    }

    const subscribersMap = this.eventSubscriberMap[eventName];
    const subscriberId = this.generateNextSubscriberId();
    subscribersMap?.set(subscriberId, onEventReceived);

    return subscriberId;
  }

  /**
   *
   * @param eventName - The name of the event to unsubscribe from.
   * @param subscriberId - The id of the subscription. Supplied when subscribe was called.
   * @returns - True if the subscriber was successfully unsubscribed, false otherwise.
   */
  public unsubscribe(eventName: string, subscriberId: string): boolean {
    if (!this.eventSet.has(eventName)) {
      throw new EventNotFoundException(eventName);
    }

    const subscribersMap = this.eventSubscriberMap[eventName];
    if (!subscribersMap?.has(subscriberId)) {
      throw new SubscriberNotFoundException(eventName, subscriberId);
    }

    return subscribersMap.delete(subscriberId);
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
    const startTime = Date.now();
    const payloadTypes = this.eventPayloadMap[eventName];
    const isValidPayload = Array.from(payloadTypes || []).some(
      (payloadType) => payload instanceof (payloadType as new (...args: any[]) => T),
    );

    if (!isValidPayload) {
      throw new InvalidPayloadTypeException(eventName);
    }

    const subscribersSet = this.eventSubscriberMap[eventName];
    subscribersSet?.forEach((callback) => {
      (callback as (payload: T) => void)(payload);
    });

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    this.inMemoryEventHistory[eventName] = this.inMemoryEventHistory[eventName] || [];
    this.inMemoryEventHistory[eventName].push({ payload, timestamp: new Date(), durationMs });
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
    const subscribersMap = this.eventSubscriberMap[eventName];
    return subscribersMap ? Array.from(subscribersMap.values()) : [];
  }

  /**
   * Lists all payload types registered for a specific event.
   * @param eventName - The name of the event.
   * @returns An array of payload type constructors.
   * @throws {EventNotFoundException} If the event is not registered.
   */
  public listPayloadTypes(eventName: string): Object[] {
    if (!this.eventSet.has(eventName)) {
      throw new EventNotFoundException(eventName);
    }
    const payloadTypes = this.eventPayloadMap[eventName];
    return payloadTypes ? Array.from(payloadTypes) : [];
  }

  /**
   * Gets the history of published events and their payloads.
   * @param eventName - The name of the event to get history for. If not provided, returns history for all events.
   * @returns A map where keys are event names and values are arrays of payloads with their timestamps and optional duration in milliseconds.
   * @throws {EventNotFoundException} If the specified event is not registered.
   */
  public getEventHistory(
    eventName?: string,
  ): Map<string, Array<{ payload: any; timestamp: Date; durationMs?: number }>> {
    const historyMap = new Map<
      string,
      Array<{ payload: any; timestamp: Date; durationMs?: number }>
    >();
    if (eventName) {
      if (!this.eventSet.has(eventName)) {
        throw new EventNotFoundException(eventName);
      }
      historyMap.set(eventName, this.inMemoryEventHistory[eventName] || []);
    } else {
      this.eventSet.forEach((event) => {
        historyMap.set(event, this.inMemoryEventHistory[event] || []);
      });
    }
    return historyMap;
  }
}

interface EventBrokerInterface {
  registerEvent<T>(eventName: string, payloadType: new (...args: any[]) => T): () => void;
  subscribe<T>(eventName: string, callback: (payload: T) => void): string;
  unsubscribe(eventName: string, subscriberId: string): boolean;
  publish<T>(eventName: string, payload: T): void;
  listRegisteredEvents(): string[];
  listSubscribers(eventName: string): Function[];
  listPayloadTypes(eventName: string): Object[];
  getEventHistory(
    eventName?: string,
  ): Map<string, Array<{ payload: any; timestamp: Date; durationMs?: number }>>;
}

export {
  EventBroker,
  EventNotFoundException,
  InvalidPayloadTypeException,
  SubscriberNotFoundException,
};
export type { EventBrokerInterface };
