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

export const sendMagicLinkEmail = async (email: string, link: string) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateLinkId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_LINK; 
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  try {
    const response = await emailjs.send(
      serviceId,
      templateLinkId,
      {
        to_email: email,
        access_link: link,
        expiry_minutes: 10,
      },
      publicKey
    );
    return response;
  } catch (error) {
    console.error("Error sending magic link email:", error);
    throw error;
  }
};

export const sendContactEmail = async (fullName: string, email: string, message: string) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateContactId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONTACT || "template_contact"; 
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "kellerrobles23@gmail.com";

  try {
    const response = await emailjs.send(
      serviceId,
      templateContactId,
      {
        to_admin_email: adminEmail,
        from_name: fullName,
        reply_to: email,
        message: message,
      },
      publicKey
    );
    return response;
  } catch (error) {
    console.error("Error sending contact email:", error);
  }
};

export const sendChatNotificationEmail = async (
  toEmail: string,
  fromEmail: string,
  fromRole: "admin" | "client",
  messageText: string
) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CHAT;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!templateId) return; // Si no está configurado, no falla
  try {
    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: toEmail,
        from_email: fromEmail,
        from_role: fromRole === "admin" ? "Administrador" : "Cliente",
        message_preview: messageText.slice(0, 200),
      },
      publicKey
    );
  } catch (error) {
    console.error("Error sending chat notification email:", error);
    // No relanzamos — la notificación es opcional, no bloquea el chat
  }
};

export const sendReplyEmail = async (clientEmail: string, clientName: string, replyMessage: string) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateReplyId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_REPLY || "template_reply"; 
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  try {
    const response = await emailjs.send(
      serviceId,
      templateReplyId,
      {
        to_email: clientEmail,
        to_name: clientName,
        reply_message: replyMessage,
      },
      publicKey
    );
    return response;
  } catch (error) {
    console.error("Error sending reply email:", error);
  }
};

