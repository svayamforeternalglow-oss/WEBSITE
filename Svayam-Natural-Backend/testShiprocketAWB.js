import shiprocket from './src/services/shiprocketService.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    process.env.SHIPROCKET_ENABLED = 'true';
    process.env.SHIPROCKET_EMAIL = 'hugeeelephant@gmail.com';
    process.env.SHIPROCKET_PASSWORD = 'w^e&QFw6zyVLDZit!5z2aKixZPH6@hNR';

    const shipmentId = '1274243031'; // From previous successful order creation
    console.log('Testing generateAWB for shipment:', shipmentId);
    
    // Try without courier_id
    const res = await shiprocket.generateAWB(shipmentId);
    console.log('AWB Result:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response data:', JSON.stringify(err.response.data, null, 2));
    }
  }
}
test();
