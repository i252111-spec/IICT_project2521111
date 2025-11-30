import java.util.logging.Logger;

@RestController
@RequestMapping("/process-payment")
public class PaymentController {

    private static final Logger LOGGER = Logger.getLogger(PaymentController.class.getName());

    @PostMapping
    public ResponseEntity<String> processPayment(
            @RequestParam("full_name") String fullName,
            @RequestParam("address") String address,
            @RequestParam("city") String city,
            @RequestParam("phone") String phone,
            @RequestParam("payment_method") String paymentMethod,
            @RequestParam(value = "card_number", required = false) String cardNumber,
            @RequestParam(value = "expiry_date", required = false) String expiryDate,
            @RequestParam(value = "cvv", required = false) String cvv) {

        if (fullName.isEmpty() || address.isEmpty() || paymentMethod.isEmpty()) {
            LOGGER.warning("Validation failed: Missing required fields.");
            return new ResponseEntity<>("Error: Missing required shipping/contact fields.", HttpStatus.BAD_REQUEST);
        }

        String transactionId = null;
        try {
            if ("credit_card".equals(paymentMethod)) {
                
                boolean paymentSuccess = processCardPayment(cardNumber, expiryDate, cvv, 15500.00); 

                if (paymentSuccess) {
                    transactionId = generateTransactionId();
                    LOGGER.info("Credit Card payment succeeded. Txn ID: " + transactionId);
                } else {
                    return new ResponseEntity<>("Credit Card Payment Failed. Please check your details or try another method.", HttpStatus.PAYMENT_REQUIRED);
                }

            } else if ("cash_on_delivery".equals(paymentMethod)) {
                
                transactionId = generateTransactionId();
                LOGGER.info("Cash on Delivery order placed. Txn ID: " + transactionId);
                
            } else if ("online_wallet".equals(paymentMethod)) {
                
                return new ResponseEntity<>("Redirecting to online wallet provider for authorization...", HttpStatus.SEE_OTHER);
            }
            
            if (transactionId != null) {
                
                saveOrderToDatabase(fullName, address, city, phone, paymentMethod, transactionId);
                
                sendOrderConfirmationEmail(fullName, transactionId);

                
                return new ResponseEntity<>("Success! Your order has been placed. Transaction ID: " + transactionId, HttpStatus.OK);
            }

        } catch (Exception e) {
            LOGGER.severe("Unhandled exception during payment processing: " + e.getMessage());
            return new ResponseEntity<>("An internal server error occurred. Please try again.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        
        return new ResponseEntity<>("Order could not be processed due to an unknown error.", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    
    private boolean processCardPayment(String number, String expiry, String cvv, double amount) {
        
        
        
        return number != null && number.length() >= 12;
    }

    private String generateTransactionId() {
        
        return "LUX-" + System.currentTimeMillis();
    }

    private void saveOrderToDatabase(String name, String addr, String city, String phone, String method, String txnId) {
        
        LOGGER.info("Saving order " + txnId + " to DB. Ship to: " + addr);
    }

    private void sendOrderConfirmationEmail(String name, String txnId) {
        
        LOGGER.info("Sending confirmation email to " + name + " for order " + txnId);
    }
}