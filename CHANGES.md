# Changes

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-02-05

### Added

- **Event History**: `getEventHistory(eventName?: string)` to retrieve event publication history with timestamps and optional duration metrics
- **Event Duration Tracking**: Measure and store the duration of event handling for performance insights

### Removed

- **Async Event Registration**: `registerAsync<T>()` removed for now to focus on core synchronous event handling features

### Fixed

- **TypeScript 5.9.3**: Updated to the latest TypeScript version for improved type safety and performance
- **Mocha Tests**: Added comprehensive unit tests for all core functionalities, including edge cases
- **Documentation**: Updated JSDoc comments for all public methods and classes for better clarity and maintainability

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
