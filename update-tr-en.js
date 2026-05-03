const fs = require('fs');

let translations = fs.readFileSync('translations.ts', 'utf8');

// Update tr
translations = translations.replace(/      topUp: "Kredi Yükle"\s*\n    }/g, `      topUp: "Kredi Yükle",
      personalInfo: "Kişisel Bilgiler",
      registrationInfo: "Kayıt Bilgileri",
      changePassword: "Şifre Değiştir",
      profession: "Meslek"
    },
    support: {
      title: "Destek Al",
      liveSupport: "Canlı Destek",
      emailSupport: "E-Posta",
      emailDesc: "Bize e-posta gönderin, dönelim.",
      name: "Adınız",
      email: "E-posta Adresiniz",
      phone: "Telefon Numaranız",
      message: "Mesajınız",
      send: "Gönder",
      success: "Mesajınız başarıyla iletildi!",
      aiAgent: "Yapay Zeka Asistanı",
      aiTyping: "Yapay zeka asistanı yazıyor...",
      userMessage: "Mesajınızı yazın..."
    }`);

// Update en
translations = translations.replace(/      topUp: "Top Up Credits"\s*\n    }/g, `      topUp: "Top Up Credits",
      personalInfo: "Personal Information",
      registrationInfo: "Registration Info",
      changePassword: "Change Password",
      profession: "Profession"
    },
    support: {
      title: "Get Support",
      liveSupport: "Live Support",
      emailSupport: "Email",
      emailDesc: "Leave us a message, we'll get back.",
      name: "Your Name",
      email: "Email Address",
      phone: "Phone Number",
      message: "Your Message",
      send: "Send Message",
      success: "Message sent successfully!",
      aiAgent: "AI Assistant",
      aiTyping: "AI is typing...",
      userMessage: "Type your message..."
    }`);

fs.writeFileSync('translations.ts', translations);
