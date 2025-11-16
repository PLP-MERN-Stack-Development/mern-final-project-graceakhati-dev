# Integration Tests

Integration tests for Planet Path API using Jest and Supertest.

## Setup

Install test dependencies:

```bash
npm install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Database Configuration

Tests use an in-memory MongoDB instance by default (via `mongodb-memory-server`).

To use a real test database, set the `TEST_MONGODB_URI` environment variable:

```bash
TEST_MONGODB_URI=mongodb://localhost:27017/planet-path-test npm test
```

## Test Files

- `setup.ts` - Test database setup and teardown utilities
- `auth.test.ts` - Authentication endpoint tests (register, login)
- `courses.test.ts` - Course endpoint tests (GET, POST)

## Test Structure

Each test file:
- Sets up a test database connection before all tests
- Clears the database between tests
- Tears down the database connection after all tests
- Tests both success and error cases
- Validates request/response formats

## Environment Variables

Tests use these environment variables (with defaults):

- `JWT_SECRET` - Default: `'test-secret-key'`
- `JWT_EXPIRE` - Default: `'7d'`
- `TEST_MONGODB_URI` - Optional: Use real MongoDB instead of in-memory

