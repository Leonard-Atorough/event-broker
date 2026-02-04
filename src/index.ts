class EventBroker {
  private eventSet: Set<string>;
  private eventPayloadMap: Map<string, Set<Object>>;
  private eventSubscriberMap: Map<string, Set<Function>>;

  constructor() {
    this.eventSet = new Set<string>();
    this.eventPayloadMap = new Map<string, Set<Object>>();
    this.eventSubscriberMap = new Map<string, Set<Function>>();
  }

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

  public listRegisteredEvents(): string[] {
    return Array.from(this.eventSet);
  }
  public listSubscribers(eventName: string): Function[] {
    if (!this.eventSet.has(eventName)) {
      throw new EventNotFoundException(eventName);
    }
    const subscribersSet = this.eventSubscriberMap.get(eventName);
    return subscribersSet ? Array.from(subscribersSet) : [];
  }
}

class EventNotFoundException extends Error {
  constructor(eventName: string) {
    super(`Event "${eventName}" is not registered.`);
    this.name = "EventNotFoundException";
  }
}

class InvalidPayloadTypeException extends Error {
  constructor(eventName: string) {
    super(`Invalid payload type for event "${eventName}".`);
    this.name = "InvalidPayloadTypeException";
  }
}

class SubscriberNotFoundException extends Error {
  constructor() {
    super(`Subscriber not found.`);
    this.name = "SubscriberNotFoundException";
  }
}

export { EventBroker };
