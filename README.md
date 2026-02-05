# Event Broker

A type-safe pub/sub event broker for TypeScript with singleton pattern, runtime payload validation, and event history tracking.

## Features

- **Type-Safe**: Full TypeScript generics support with runtime validation
- **Singleton Pattern**: Global event broker instance
- **Event History**: Track published events with timestamps and execution duration
- **Error Handling**: Custom exceptions for invalid operations
- **Memory Efficient**: O(1) event lookups using Sets

## Installation

```bash
npm install
```

## Quick Start

```typescript
import { EventBroker } from "./src/index.js";

// Get singleton instance
const broker = EventBroker.getInstance();

// Register event with payload type
class UserCreated {
  id: string;
  email: string;
}
const unregister = broker.registerEvent("userCreated", UserCreated);

// Subscribe to event
const subscriberId = broker.subscribe("userCreated", (user) => {
  console.log("User created:", user.email);
});

// Publish event
broker.publish("userCreated", new UserCreated());

// Cleanup
broker.unsubscribe("userCreated", subscriberId);
unregister();
```

## API Reference

### Core Methods

#### `getInstance(): EventBroker`

Returns the singleton instance of EventBroker.

#### `registerEvent<T>(eventName: string, payloadType: new (...args: any[]) => T): () => void`

Registers an event with a payload type. Multiple payload types can be registered for the same event.

**Returns:** Unregister function to remove the payload type.

**Throws:** None

#### `subscribe<T>(eventName: string, callback: (payload: T) => void): string`

Subscribes to an event.

**Returns:** Subscriber ID for later unsubscription.

**Throws:** `EventNotFoundException` if event is not registered.

#### `unsubscribe(eventName: string, subscriberId: string): boolean`

Unsubscribes a subscriber from an event.

**Returns:** `true` if successful.

**Throws:** `EventNotFoundException`, `SubscriberNotFoundException`

#### `publish<T>(eventName: string, payload: T): void`

Publishes an event to all subscribers with automatic type validation.

**Throws:** `EventNotFoundException`, `InvalidPayloadTypeException`

### Inspection Methods

#### `listRegisteredEvents(): string[]`

Returns all registered event names.

#### `listSubscribers(eventName: string): Function[]`

Returns subscriber callbacks for an event.

**Throws:** `EventNotFoundException`

#### `listPayloadTypes(eventName: string): Object[]`

Returns payload type constructors for an event.

**Throws:** `EventNotFoundException`

#### `getEventHistory(eventName?: string): Map<string, Array<{payload, timestamp, durationMs}>>`

Returns event history with timestamps and execution duration.

**Throws:** `EventNotFoundException` if event doesn't exist.

## Exceptions

| Exception                     | Thrown When                                     |
| ----------------------------- | ----------------------------------------------- |
| `EventNotFoundException`      | Event is not registered                         |
| `InvalidPayloadTypeException` | Published payload doesn't match registered type |
| `SubscriberNotFoundException` | Unsubscribing non-existent subscriber           |

## License

MIT
