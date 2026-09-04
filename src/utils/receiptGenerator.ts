import type { CartItem, DIYSelection } from '../models/MenuModel';
import { drawQrCodeToCanvas } from './qrCode';

export interface ReceiptOptions {
  cart?: CartItem[];
  cartTotal?: number;
  diySelection?: DIYSelection;
  diyTotal?: number;
  transactionNumber?: string;
  diningOption?: 'dine-in' | 'takeout';
  cookingFee?: number;
  customerName?: string;
}

/**
 * Generates an itemized E-Invoice PNG on an HTML5 canvas and downloads it to the client.
 * Features an authentic QR code encoding the transaction number for instant scanning at the POS.
 */
export const downloadEInvoiceReceipt = async ({
  cart = [],
  cartTotal = 0,
  diySelection,
  diyTotal = 0,
  transactionNumber,
  diningOption = 'dine-in',
  cookingFee = 0,
  customerName
}: ReceiptOptions): Promise<void> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 450;
  const items = cart.length > 0 ? cart : [];
  const txnNumber = transactionNumber || `TXN-${Date.now().toString().slice(-6)}`;
  const effectiveSubtotal = cartTotal || diyTotal || 0;
  const grandTotal = effectiveSubtotal + cookingFee;

  // Calculate height dynamically to accommodate items + cooking fee + QR code
  let height = 480; // base height with QR code section
  if (items.length > 0) {
    items.forEach((item) => {
      height += 50;
      if (item.type === 'bowl' && item.bowlDetails) {
        if (item.bowlDetails.toppings) height += item.bowlDetails.toppings.length * 22;
        if (item.bowlDetails.drinks && item.bowlDetails.drinks.length > 0) {
          height += item.bowlDetails.drinks.length * 22;
        } else if (item.bowlDetails.drink) {
          height += 25;
        }
      }
    });
  } else {
    const toppingsCount = diySelection?.toppings?.length || 0;
    const drinksCount = diySelection?.drinks?.length || (diySelection?.drink ? 1 : 0);
    height += (toppingsCount > 0 ? 40 + toppingsCount * 28 : 0) + (drinksCount > 0 ? 40 + drinksCount * 28 : 0);
  }

  if (cookingFee > 0) {
    height += 30;
  }

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Border outline
  ctx.strokeStyle = '#5B240B';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, width - 8, height - 8);

  // Header Title
  ctx.fillStyle = '#5B240B';
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px Courier New';
  ctx.fillText('B.B.K. RAMYEON HAUZ', width / 2, 42);

  ctx.font = 'bold 12px Courier New';
  ctx.fillText('DIY KOREAN RAMYEON E-INVOICE', width / 2, 64);
  ctx.font = '10px Courier New';
  ctx.fillText('San Pablo City, Philippines', width / 2, 80);
  ctx.fillText(
    `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    width / 2,
    95
  );

  // Transaction & Dining Mode Banner Card
  ctx.fillStyle = '#5B240B';
  ctx.fillRect(25, 108, width - 50, 34);
  ctx.fillStyle = '#FAF1D6';
  ctx.font = 'bold 12px Courier New';
  ctx.fillText(
    `TXN: ${txnNumber} • ${diningOption === 'dine-in' ? 'DINE-IN (COOK IN HAUZ)' : 'TAKEOUT (RAW)'}`,
    width / 2,
    130
  );

  if (customerName) {
    ctx.fillStyle = '#5B240B';
    ctx.font = 'bold 11px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`Customer: ${customerName}`, 30, 160);
  }

  // Dashed Divider
  let y = customerName ? 175 : 160;
  ctx.strokeStyle = '#5B240B';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(25, y);
  ctx.lineTo(width - 25, y);
  ctx.stroke();

  y += 24;

  if (items.length > 0) {
    items.forEach((item, index) => {
      ctx.fillStyle = '#5B240B';
      ctx.textAlign = 'left';
      ctx.font = 'bold 12px Courier New';
      ctx.fillText(`${index + 1}. ${item.name.toUpperCase()} (x${item.quantity})`, 30, y);
      ctx.textAlign = 'right';
      ctx.fillText(`PHP ${item.price * item.quantity}`, width - 35, y);
      y += 20;

      if (item.type === 'bowl' && item.bowlDetails) {
        ctx.font = '11px Courier New';
        if (item.bowlDetails.ramyeon) {
          ctx.textAlign = 'left';
          ctx.fillText(`   Base: ${item.bowlDetails.ramyeon.name}`, 35, y);
          y += 18;
        }
        if (item.bowlDetails.toppings && item.bowlDetails.toppings.length > 0) {
          item.bowlDetails.toppings.forEach((t) => {
            ctx.textAlign = 'left';
            ctx.fillText(`   + ${t.product.name} (x${t.quantity})`, 35, y);
            y += 18;
          });
        }
        if (item.bowlDetails.drinks && item.bowlDetails.drinks.length > 0) {
          item.bowlDetails.drinks.forEach((d) => {
            ctx.textAlign = 'left';
            ctx.fillText(`   + Drink: ${d.product.name} (x${d.quantity})`, 35, y);
            y += 18;
          });
        } else if (item.bowlDetails.drink) {
          ctx.textAlign = 'left';
          ctx.fillText(`   + Drink: ${item.bowlDetails.drink.name}`, 35, y);
          y += 18;
        }
      }
      y += 8;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(width - 30, y);
      ctx.stroke();
      y += 15;
    });
  } else if (diySelection) {
    // Single bowl fallback
    ctx.fillStyle = '#5B240B';
    ctx.textAlign = 'left';
    ctx.font = 'bold 12px Courier New';
    ctx.fillText('BASE RAMYEON NOODLE', 30, y);
    ctx.font = '13px Courier New';
    ctx.fillText(diySelection.ramyeon ? diySelection.ramyeon.name : 'None Selected', 35, y + 22);
    ctx.textAlign = 'right';
    ctx.fillText(diySelection.ramyeon ? `PHP ${diySelection.ramyeon.price}` : 'PHP 0', width - 35, y + 22);
    y += 45;

    if (diySelection.toppings && diySelection.toppings.length > 0) {
      diySelection.toppings.forEach((t) => {
        y += 24;
        ctx.textAlign = 'left';
        ctx.fillText(`${t.product.name} (x${t.quantity})`, 35, y);
        ctx.textAlign = 'right';
        ctx.fillText(`PHP ${t.product.price * t.quantity}`, width - 35, y);
      });
      y += 22;
    }

    const fallbackDrinks =
      diySelection.drinks && diySelection.drinks.length > 0
        ? diySelection.drinks
        : diySelection.drink
        ? [{ product: diySelection.drink, quantity: 1 }]
        : [];

    if (fallbackDrinks.length > 0) {
      fallbackDrinks.forEach((d) => {
        y += 24;
        ctx.textAlign = 'left';
        ctx.fillText(`🥤 ${d.product.name} (x${d.quantity})`, 35, y);
        ctx.textAlign = 'right';
        ctx.fillText(`PHP ${d.product.price * d.quantity}`, width - 35, y);
      });
      y += 22;
    }
  }

  // Dine-In Cooking Fee Line (if applicable)
  if (cookingFee > 0) {
    ctx.fillStyle = '#5B240B';
    ctx.textAlign = 'left';
    ctx.font = 'bold 12px Courier New';
    ctx.fillText('DINE-IN COOKING FEE', 30, y);
    ctx.textAlign = 'right';
    ctx.fillText(`PHP ${cookingFee}`, width - 35, y);
    y += 24;
  }

  // Financial Grand Total Section
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(25, y);
  ctx.lineTo(width - 25, y);
  ctx.stroke();
  y += 25;

  ctx.fillStyle = '#5B240B';
  ctx.textAlign = 'left';
  ctx.font = 'bold 14px Courier New';
  ctx.fillText('GRAND TOTAL', 30, y);
  ctx.textAlign = 'right';
  ctx.font = 'bold 16px Courier New';
  ctx.fillText(`PHP ${grandTotal}`, width - 35, y);

  // QR Code & Barcode Section for POS Scanner
  y += 20;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(25, y);
  ctx.lineTo(width - 25, y);
  ctx.stroke();

  // Render authentic scannable QR Code
  const qrSize = 120;
  const qrX = (width - qrSize) / 2;
  const qrY = y + 15;
  await drawQrCodeToCanvas(ctx, txnNumber, qrX, qrY, qrSize);

  // Instructions for POS scanning
  y = qrY + qrSize + 18;
  ctx.fillStyle = '#5B240B';
  ctx.textAlign = 'center';
  ctx.font = 'bold 11px Courier New';
  ctx.fillText('SCAN QR CODE AT POS CASHIER COUNTER', width / 2, y);

  ctx.font = '10px Courier New';
  ctx.fillText(`Or provide Transaction Code: ${txnNumber}`, width / 2, y + 16);

  ctx.font = 'bold 11px Courier New';
  ctx.fillText('MAKE • EAT • ENJOY', width / 2, y + 36);

  // Download trigger
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `bbk-${txnNumber.toLowerCase()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
