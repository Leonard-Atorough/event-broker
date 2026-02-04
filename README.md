# Event Broker

A type-safe, generic event broker for TypeScript that enables decoupled communication between components through a publish-subscribe pattern.

## Features

- **Type-Safe Generics**: Full TypeScript support with generic payload types
- **Event Registration**: Register events with specific payload types
- **Subscribe & Publish**: Subscribe to events and publish payloads with automatic type validation
- **Unsubscribe**: Manage subscriptions with cleanup functions
- **Error Handling**: Custom exceptions for missing events and invalid payload types

## Installation

```bash
npm install
```

## Usage

### Register an Event

```typescript
const broker = new EventBroker();

class UserCreatedPayload {
  userId: string;
  email: string;
}

broker.registerEvent<UserCreatedPayload>("userCreated", UserCreatedPayload);
```

### Subscribe to an Event

```typescript
const unsubscribe = broker.subscribe<UserCreatedPayload>("userCreated", (payload) => {
  console.log(`User created: ${payload.email}`);
});

// Unsubscribe when done
unsubscribe();
```

### Publish an Event

```typescript
const payload = new UserCreatedPayload();
payload.userId = "123";
payload.email = "user@example.com";

broker.publish<UserCreatedPayload>("userCreated", payload);
```

## API

### `registerEvent<T>(eventName: string, payloadType: new () => T): () => void`

Registers a new event with a specific payload type. Returns an unregister function.

### `subscribe<T>(eventName: string, callback: (payload: T) => void): () => void`

Subscribes to an event. Returns an unsubscribe function.

### `publish<T>(eventName: string, payload: T): void`

Publishes an event to all subscribers. Validates payload type at runtime.

### `listRegisteredEvents(): string[]`

Returns an array of all registered event names.

### `listSubscribers(eventName: string): Function[]`

Returns an array of subscribers for a given event.

## Error Handling

- **EventNotFoundException**: Thrown when subscribing to or publishing an unregistered event
- **InvalidPayloadTypeException**: Thrown when publishing a payload that doesn't match the registered type
- **SubscriberNotFoundException**: Thrown when attempting to unsubscribe a non-existent subscriber

## Future Features

Here are some planned features for future releases:

- **Wildcard Event Subscriptions**: Support for subscribing to multiple events using wildcard patterns.
- **Event Prioritization**: Allow prioritizing certain subscribers to handle events before others.
- **Persistent Event Storage**: Enable storing events to a database for replay or auditing purposes.
- **Batch Event Publishing**: Support for publishing multiple events in a single operation.
- **Enhanced Debugging Tools**: Provide better logging and debugging utilities for event flows.
- **Asynchronous Event Handling**: Support for asynchronous subscribers and event processing.
- **Event Filtering**: Allow subscribers to filter events based on custom criteria.

## License

MIT
