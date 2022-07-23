require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNTS_ID;
const authToken = process.env.TWILIO_AUTHTOKEN_ID;
const serviceSID = process.env.TWILIO_SERVICES_ID;
const client = require("twilio")(accountSid, authToken);

module.exports = {
  makeOtp: (phoneNumber) => {
    return new Promise(async (resolve, reject) => {
      client.verify
        .services(serviceSID)
        .verifications.create({
          to: `+91${phoneNumber.mobilenumber}`,
          channel: "sms",
        })
        .then((response) => {
          console.log("ok");
          console.log(response);
          resolve(response);
        })
        .catch((err) => {
          console.log("its error" + err);
        });
    });
  },
  verifyOtp: (otp, phoneNumber) => {
    return new Promise(async (resolve, reject) => {
      console.log(phoneNumber);
      await client.verify
        .services(serviceSID)
        .verificationChecks.create({
          to: `+91${phoneNumber.mobilenumber}`,
          code: otp.otp,
        })
        .then((verification_check) => {
          resolve(verification_check);
        })
        .catch((err) => {
          console.log("its error" + err);
        });
    });
  },
};
