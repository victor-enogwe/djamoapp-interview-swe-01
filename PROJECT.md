# Design Summary

The design will make use of the event-driven architecture with a message producer service and a consumer service. It will also allow the producer and consumer to be deployed separately, allowing them to scale as needed.

The transactions are processed in worker queues, using sandboxed processes run in a separate process to allow for scale. They are also designed to be standalone, so that they can be deployed and invoked elsewhere (eg. From AWS as a [lambda](https://docs.aws.amazon.com/lambda/latest/dg/getting-started.html)).

The Event-driven architecture leverages a message queue provider [Bullmq](https://github.com/taskforcesh/bullmq). The producer service is a [Fastify](https://github.com/fastify/fastify) http server which creates the jobs.

## Breakdown of Your API Project Requirements

- Create transaction post endpoint:
  - endpoint will accept body with transaction id(idempotent)
  - endpoint will respond with accept immediately once it creates the events below
  - transaction creation events (with retry mechanism)
    - dispatch event to create the transaction in the db
    - dispatch event to create the transaction at third party.
    - dispatch event to update transaction status locally(exponential backoff)
    - dispatch event to update transaction status in client
- Create Transaction in Database event handler:
  - handler will create transaction if not exist.
  - handler will not create duplicate if transaction exists.
- Create Transaction in Third party event handler
  - Handler will check third party if transaction exists(not implemented in third party code)
  - Handler will create transaction in third party
  - Handler will retry if 504: (check exists for transaction existing)
  - Handler will retry creation (3) times (backoff 120s)
  - Handler will fail creation and update transaction status locally accordingly
- Update Transaction status locally event handler:
  - Handler will poll third party for transaction details if:
    - Webhook handler has not returned an update.
    - Handler will poll third party API(because webhook may not be triggered) at:
      - 200ms - if no status, dispatch Update Transaction status event with default status(pending)
      - 10ms
      - exponentially increasing time afterwards(to avoid too many requests)
  - Handler will succeed and stop if:
    - Cancelled by webhook endpoint
    - If transaction status is obtained from third party.
    - After a specified max amount of time
- Update Transaction status in client event handler:
  - call the client transaction endpoint to update transaction status.
- Create webhook endpoint:
  - endpoint will accept body with transaction id and status
  - endpoint will complete the Update transaction status locally event.

## Setup Development Environment

- Setup project structure
- Setup project linters and formatters
- Initialize api project
- Initialize Testing

## Extra Considerations

- Authenticate webhook url
- Make server more secure by adding more settings(cors, headers etc.)
- Tests
