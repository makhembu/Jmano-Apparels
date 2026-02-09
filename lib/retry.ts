/**
 * Retries a function that returns a promise.
 * @param fn The function to retry.
 * @param retries Maximum number of retries.
 * @param delay Delay in milliseconds between retries.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2); // Exponential backoff
  }
}