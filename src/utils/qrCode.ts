import QRCode from 'qrcode';

/**
 * Generates a standard high-contrast QR code data URL (PNG format).
 * Can be scanned by any smartphone camera, barcode/QR scanner gun, or web scanner.
 */
export async function generateQrCodeDataUrl(text: string, size: number = 180): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: '#5B240B', // BBK brand dark brown
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
    return '';
  }
}

/**
 * Draws a QR code directly onto an existing 2D canvas at (x, y) with the specified size.
 */
export async function drawQrCodeToCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number = 140
): Promise<void> {
  try {
    const dataUrl = await generateQrCodeDataUrl(text, size);
    if (!dataUrl) return;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, x, y, size, size);
        resolve();
      };
      img.onerror = () => {
        console.error('Failed to load QR image onto canvas context');
        resolve();
      };
      img.src = dataUrl;
    });
  } catch (err) {
    console.error('Error drawing QR code to canvas:', err);
  }
}
