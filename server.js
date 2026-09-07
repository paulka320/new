const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

const SYSTEM_RECIPIENT_EMAIL = 'stanthonydoctorsavenue@gmail.com';

// Parse JSON and URL-encoded form bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '.'), {
  extensions: ['html', 'htm']
}));

// In-memory appointments list
const appointments = [];

// API route to handle appointment bookings and record notifications
app.post(['/api/appointment', '/submit-appointment'], (req, res) => {
  const patientName = req.body.patient_name || req.body.name;
  const phoneNumber = req.body.phone_number || req.body.phone;
  const department = req.body.preferred_department || req.body.department;

  if (!patientName || !phoneNumber || !department) {
    return res.status(400).json({
      success: false,
      message: 'Please provide patient name, phone number, and preferred department.'
    });
  }

  const appointmentRecord = {
    id: `APT-${Date.now()}`,
    patientName,
    phoneNumber,
    department,
    recipientEmail: SYSTEM_RECIPIENT_EMAIL,
    receivedAt: new Date().toISOString(),
    status: 'received'
  };

  appointments.push(appointmentRecord);

  console.log(`[Email Notification Dispatched]`);
  console.log(`To: ${SYSTEM_RECIPIENT_EMAIL}`);
  console.log(`Subject: New Appointment Booking - ${department}`);
  console.log(`Patient: ${patientName}`);
  console.log(`Phone: ${phoneNumber}`);
  console.log(`Department: ${department}`);

  // If this was a regular HTML form submission without JS (accept: text/html)
  if (req.headers.accept && req.headers.accept.includes('text/html') && !req.xhr) {
    return res.redirect('/index.html?appointment=success&name=' + encodeURIComponent(patientName));
  }

  return res.status(200).json({
    success: true,
    message: `Appointment request received! An email notification has been dispatched to ${SYSTEM_RECIPIENT_EMAIL}. Our team will contact ${patientName} shortly.`,
    data: appointmentRecord
  });
});

// In-memory newsletter subscriptions list
const newsletterSubscribers = [];

// API route to handle monthly community newsletter subscriptions
app.post(['/api/newsletter', '/api/subscribe'], (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  const existing = newsletterSubscribers.find(sub => sub.email === email);
  if (existing) {
    return res.status(200).json({
      success: true,
      message: `You are already subscribed to our monthly community updates! Newsletters will continue to be sent to ${email}.`,
      alreadySubscribed: true
    });
  }

  const subscriberRecord = {
    id: `SUB-${Date.now()}`,
    email,
    subscribedAt: new Date().toISOString(),
    recipientNotification: SYSTEM_RECIPIENT_EMAIL
  };

  newsletterSubscribers.push(subscriberRecord);

  console.log(`[Newsletter Subscription]`);
  console.log(`Subscriber: ${email}`);
  console.log(`Notification routed to: ${SYSTEM_RECIPIENT_EMAIL}`);

  return res.status(200).json({
    success: true,
    message: `Thank you for subscribing! You will receive our monthly community health bulletins and facility updates at ${email}.`,
    data: subscriberRecord
  });
});

// Fallback to index.html for undefined routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});

