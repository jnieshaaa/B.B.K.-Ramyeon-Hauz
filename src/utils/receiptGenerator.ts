import type { CartItem, DIYSelection } from '../models/MenuModel';

interface ReceiptOptions {
  cart?: CartItem[];
  cartTotal?: number;
  diySelection?: DIYSelection;
  diyTotal?: number;
}

/**
 * Generates an itemized E-Invoice PNG on an HTML5 canvas and downloads it to the client.
 */
export const downloadEInvoiceReceipt = ({
  cart = [],
  cartTotal = 0,
  diySelection,
  diyTotal = 0
}: ReceiptOptions): void => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 450;
  const items = cart.length > 0 ? cart : [];
  const effectiveTotal = cartTotal || diyTotal || 0;

  // Calculate height dynamically
  let height = 300;
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
    height = 340 + (toppingsCount > 0 ? 40 + toppingsCount * 28 : 0) + (drinksCount > 0 ? 40 + drinksCount * 28 : 0);
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
  ctx.fillText('B.B.K. RAMYEON HAUZ', width / 2, 45);

  ctx.font = 'bold 12px Courier New';
  ctx.fillText('GROUP DINE-IN E-INVOICE', width / 2, 70);
  ctx.font = '10px Courier New';
  ctx.fillText('San Pablo City, Philippines', width / 2, 88);
  ctx.fillText(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, width / 2, 105);

  // Dashed Divider
  ctx.strokeStyle = '#5B240B';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(25, 120);
  ctx.lineTo(width - 25, 120);
  ctx.stroke();

  let y = 145;

  if (items.length > 0) {
    items.forEach((item, index) => {
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

    const fallbackDrinks = diySelection.drinks && diySelection.drinks.length > 0
      ? diySelection.drinks
      : (diySelection.drink ? [{ product: diySelection.drink, quantity: 1 }] : []);

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

  // Total Section
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(25, y);
  ctx.lineTo(width - 25, y);
  ctx.stroke();
  y += 25;

  ctx.textAlign = 'left';
  ctx.font = 'bold 14px Courier New';
  ctx.fillText('GRAND TOTAL', 30, y);
  ctx.textAlign = 'right';
  ctx.font = 'bold 16px Courier New';
  ctx.fillText(`PHP ${effectiveTotal}`, width - 35, y);

  // Footer Section
  y += 25;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(25, y);
  ctx.lineTo(width - 25, y);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = 'bold 11px Courier New';
  ctx.fillText('MAKE • EAT • ENJOY', width / 2, y + 25);
  ctx.font = '9px Courier New';
  ctx.fillText('Send this e-invoice receipt image to our FB Page/Email', width / 2, y + 42);
  ctx.fillText('to complete your order reservation.', width / 2, y + 54);

  // Trigger download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `bbk-group-order-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
