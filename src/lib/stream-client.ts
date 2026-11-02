/** Reads a plain-text streaming response, calling `onText` with the full text so far. */
export async function readTextStream(response: Response, onText: (text: string) => void): Promise<string> {
  if (!response.body) throw new Error("No response body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onText(text);
  }
  text += decoder.decode();
  onText(text);
  return text;
}
