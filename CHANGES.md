# Changes

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-02-04

### Added

- **EventBroker**: Singleton-pattern pub/sub event broker with type-safe generics
- **Event Registration**: `registerEvent<T>()` with payload type validation
- **Subscriptions**: `subscribe<T>()` and `publish<T>()` with automatic type checking
- **Event Introspection**: List registered events, subscribers, and payload types
- **Exception Handling**: `EventNotFoundException`, `InvalidPayloadTypeException`, `SubscriberNotFoundException`
- **Async Support**: `registerAsync<T>()` for asynchronous event registration
- **TypeScript 5.9.3** with full type safety and ES modules
- **Mocha test framework** for unit testing
