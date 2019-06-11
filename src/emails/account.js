// Common variable name in Sendgrid API documentation is "sgMail".
const sgMail = require('@sendgrid/mail');

// Set up our API Key.
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function for sending a welcome email upon creating a new profile.
const sendWelcomeEmail = (email, name) => {
    // The send() method is async and returns a promise.
    sgMail.send({
        to: email,
        from: 'chris-93@live.co.uk',
        subject: 'Welcome!',
        text: `Welcome to the app, ${name}. Let me know how you like, or don't like, things.`
    });
}

// Function for sending a cancellation email upon deleting an existing profile.
const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'chris-93@live.co.uk',
        subject: 'Bye Bye :(',
        text: `${name}! It pains me to see you leave! Please let me know if there's anything that could have been done to keep you on board.`
    });
}

// Using an object here to export multiple functions.
module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}