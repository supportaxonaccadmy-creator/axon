export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      resolve();
    } catch {
      reject(new Error('Failed to copy to clipboard'));
    }
  });
}

export function downloadFile(content: BlobPart, filename: string, mimeType?: string): void {
  const blob = new Blob([content], mimeType ? { type: mimeType } : undefined);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function openUrl(url: string, target: string = '_blank'): void {
  window.open(url, target, 'noopener,noreferrer');
}

export function scrollToTop(smooth: boolean = true): void {
  window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
}

export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight ?? document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth ?? document.documentElement.clientWidth)
  );
}
