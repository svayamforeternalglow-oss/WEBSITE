import axios from 'axios';
const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external';

async function test() {
  try {
    const email = 'hugeeelephant@gmail.com';
    const password = 'w^e&QFw6zyVLDZit!5z2aKixZPH6@hNR';
    console.log('Fetching token for', email);
    const response = await axios.post(`${SHIPROCKET_BASE}/auth/login`, {
      email,
      password,
    });
    console.log('Token fetched successfully');
  } catch (err) {
    console.error('Error fetching token:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  }
}
test();
