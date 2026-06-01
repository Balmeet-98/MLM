/**
 * Open Razorpay checkout. Requires checkout.js in index.html.
 */
export function openRazorpayCheckout({
  order,
  description,
  prefill = {},
  onSuccess,
  onDismiss,
  onFailed,
}) {
  if (!window.Razorpay) {
    throw new Error('Payment gateway failed to load. Please refresh the page.');
  }

  const rzp = new window.Razorpay({
    key: order.keyId,
    amount: order.amount,
    currency: order.currency,
    name: 'Samriddhi Network',
    description,
    order_id: order.orderId,
    prefill,
    theme: { color: '#EA580C' },
    handler: onSuccess,
    modal: {
      ondismiss: onDismiss,
    },
  });

  rzp.on('payment.failed', onFailed);
  rzp.open();
}
