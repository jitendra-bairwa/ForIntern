const fetch = require('node-fetch'); 

//Google reCAPTCHA secret key
const RECAPTCHA_SECRET_KEY = '6Lf43UkqAAAAAL_ex4dmd57ZxSnRadtcMKo1ADvN';

// verify reCAPTCHA response
async function verifyRecaptcha(token) {
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`, {
    method: 'POST',
  });
  const data = await response.json();
  return data.success;
}

module.exports = {
  verifyRecaptcha,
};
