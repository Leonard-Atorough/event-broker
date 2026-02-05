# Roadmap

## Version 1.0.0

- **Singleton Pattern**: Single instance for global access
- **Event History**: Track published events with timestamps and execution duration
- **Error Handling**: Custom exceptions for invalid operations
- **Memory Efficient**: O(1) event lookups using Sets

## Version 1.0.1

- **Multiple Payload Types**: Support registering multiple payload types for the same event
- **Improved Type Safety**: Enhanced TypeScript typings for better developer experience
- **Performance Optimizations**: Refactor internal data structures for faster event lookups and reduced memory usage
- **Documentation**: Comprehensive API reference and usage examples in README.md
- **Testing**: Add unit tests for all core functionalities to ensure reliability and maintainability
- **Error Handling Enhancements**: More descriptive error messages and additional custom exceptions for edge cases
- **Event History Enhancements**: Include payload data in event history for better debugging and analytics
- **Subscription Management**: Add functionality to list current subscribers for an event and manage subscriptions more effectively
- **TypeScript Generics**: Full support for TypeScript generics to allow for more flexible event payloads

## Future Enhancements

- **Event Prioritization**: Allow subscribers to specify priority levels for event handling
- **Asynchronous Event Handling**: Support for asynchronous event handlers and promises
- **Event Namespacing**: Allow for namespaced events to avoid naming collisions in larger applications
- **Integration with External Systems**: Provide adapters for integrating with external messaging systems like RabbitMQ or Kafka
- **WebSocket Support**: Enable real-time event broadcasting over WebSockets for web applications
- **Event Filtering**: Allow subscribers to specify filters for events they are interested in
- **Metrics and Analytics**: Provide built-in metrics for event publishing and subscription patterns
- **Plugin System**: Allow for custom plugins to extend the functionality of the event broker without modifying core code

## Prospective Improvements

- **TypeScript Decorators**: Use decorators for more intuitive event registration and subscription
- **Event Batching**: Support for batching multiple events together for improved performance in high-throughput scenarios
- **Distributed Event Broker**: Explore options for a distributed event broker to support microservices architectures
- **GraphQL Integration**: Provide support for GraphQL subscriptions to allow real-time updates in GraphQL APIs
- **Cross-Platform Support**: Ensure compatibility with both Node.js and browser environments for wider adoption
- **Community Contributions**: Encourage and facilitate contributions from the community to enhance features and fix bugs
- **TypeScript Version Compatibility**: Ensure compatibility with the latest TypeScript versions and features for improved developer experience
- **Documentation Enhancements**: Continuously improve documentation with more examples, use cases, and best practices for using the event broker effectively in various scenarios.

# Note

(In reality, this is just an idea list for me. I'm developing this library as a side project to learn TypeScript and design patterns, so the roadmap is flexible and may evolve based on my learning journey and user feedback.)
