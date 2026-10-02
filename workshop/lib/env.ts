// Load a local .env if present (cloud environments inject variables directly, so it is optional).
// Imported for its side effect by every CLI entry point.
try {
  process.loadEnvFile(".env");
} catch {
  // no .env: fine
}
