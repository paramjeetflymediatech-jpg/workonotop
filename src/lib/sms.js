export async function sendSMS(to, message) {
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        console.log('Twilio credentials not configured in .env. Skipping SMS.');
        return false;
    }
    
    // Twilio requires E.164 formatting, we'll try to ensure it starts with '+' if it's 10 digits
    let formattedTo = to.replace(/[^0-9+]/g, '');
    if (formattedTo.length === 10 && !formattedTo.startsWith('+')) {
        formattedTo = '+91' + formattedTo; // Changed to +91 for India
    }
    
    try {
        const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
        const formData = new URLSearchParams();
        formData.append('To', formattedTo);
        formData.append('From', TWILIO_PHONE_NUMBER);
        formData.append('Body', message);

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
        
        if (!response.ok) {
            const err = await response.text();
            console.error('Twilio Error:', err);
            return false;
        }
        
        console.log(`SMS sent successfully to ${formattedTo}`);
        return true;
    } catch (e) {
        console.error('Error sending SMS via Twilio:', e);
        return false;
    }
}
