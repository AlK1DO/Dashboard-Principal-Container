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
  const templateUniversalId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONTACT; 
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "jjsjpm2@gmail.com";

  try {
    const response = await emailjs.send(
      serviceId,
      templateUniversalId,
      {
        to_email: adminEmail,
        reply_to: email,
        dynamic_subject: `Nuevo contacto desde la web de: ${fullName}`,
        dynamic_content: `Tienes un nuevo mensaje desde el formulario web.\n\nNombre del cliente: ${fullName}\nCorreo del cliente: ${email}\n\nMensaje:\n${message}`,
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
  // Usamos la misma plantilla universal
  const templateUniversalId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONTACT;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!templateUniversalId) return;
  
  const roleName = fromRole === "admin" ? "Soporte Técnico" : "Cliente";
  try {
    await emailjs.send(
      serviceId,
      templateUniversalId,
      {
        to_email: toEmail,
        reply_to: fromEmail,
        dynamic_subject: `Nuevo mensaje de ${roleName} en Sempiterno`,
        dynamic_content: `Has recibido un nuevo mensaje en el chat.\n\nRemitente: ${fromEmail} (${roleName})\n\nMensaje:\n${messageText.slice(0, 200)}${messageText.length > 200 ? '...' : ''}\n\nIngresa a la plataforma para responder.`,
      },
      publicKey
    );
  } catch (error) {
    console.error("Error sending chat notification email:", error);
  }
};

export const sendReplyEmail = async (clientEmail: string, clientName: string, replyMessage: string) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateUniversalId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CONTACT; 
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  try {
    const response = await emailjs.send(
      serviceId,
      templateUniversalId,
      {
        to_email: clientEmail,
        reply_to: import.meta.env.VITE_ADMIN_EMAIL || "jjsjpm2@gmail.com",
        dynamic_subject: `Tu solicitud de contacto fue aprobada`,
        dynamic_content: `Hola ${clientName},\n\nTu solicitud de contacto ha sido revisada y aprobada. Aquí tienes la respuesta de nuestro equipo:\n\n${replyMessage}\n\nYa puedes iniciar sesión en la plataforma en cualquier momento usando tu correo electrónico (${clientEmail}) para continuar chateando con nosotros.\n\nAtentamente,\nEquipo Sempiterno.`,
      },
      publicKey
    );
    return response;
  } catch (error) {
    console.error("Error sending reply email:", error);
  }
};

