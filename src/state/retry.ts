export default async function retry<Result>(action: () => Result | Promise<Result>, tries: number, delay = 100): Promise<Result> {
  try {
    return await action();
  } catch (e) {
    if (tries <= 0) throw e;
    await new Promise((r) => setTimeout(r, delay));
    return retry(action, tries - 1, delay * 10);
  }
}
