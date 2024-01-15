const { createMollieClient } = require('@mollie/api-client');

const mollieClient = createMollieClient({ apiKey: 'test_rRDbrdE7DAb67ypErz44Vg5bvH66r2' });

(async () => {
  const payment = await mollieClient.payments.create({
    amount: {
      currency: 'EUR',
      value: '350.00', // We enforce the correct number of decimals through strings
    },
    description: 'Factuur werkorder 2231232',
	 redirectUrl: 'https://webshop.example.org/order/12345/',
     metadata: {
      order_id: '2231232',
    }
})
  .then(payment => {
	  console.log("Betaallink: " + payment.getCheckoutUrl());
	  console.log("QR Code:" + payment.getQRCode());
    // Forward the customer to the payment.getCheckoutUrl()
  })
  .catch(error => {
    // Handle the error
  });
})();