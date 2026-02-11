let cached: string | null = null;

export async function getLogoBase64(): Promise<string> {
  if (cached) return cached;

  const res = await fetch('/Linemaster Blue Corporate Logo 2.png');
  const blob = await res.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      cached = reader.result as string;
      resolve(cached);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
