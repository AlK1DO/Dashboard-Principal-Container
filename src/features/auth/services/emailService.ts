import emailjs from "@emailjs/browser";

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (email: string, otp: string) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  try {
    const response = await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: email,
        otp_code: otp,
      },
      publicKey
    );
    return response;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

