const fs = require('fs');

let translations = fs.readFileSync('translations.ts', 'utf8');

const additional = `
  fr: {
    modes: {
      retoucher: "Retoucheur Haut de Gamme",
      fashion: "Mode de Luxe",
      promptToImage: "Prompt vers Image",
      upscale: "Amélioration / Clarté Image",
      video: "Vidéo / 360°"
    },
    sidebar: {
      brandKit: "Kit de Marque",
      lockConfig: "Verrouiller la Configuration",
      locked: "Verrouillé",
      brandColor: "Couleur de Marque",
      bgPreference: "Préférence de Fond",
      configuration: "Configuration",
      bulkMode: "Mode par Lots",
      targetFinishes: "Finitions Cibles",
      studioEnv: "Environnement Studio",
      groundGloss: "Brillance du Sol",
      catalogExport: "Exportation Catalogue (Format)",
      jewelChanger: "Changeur de Bijoux (Pierres Alternatives)",
      packagingShot: "Mode Photo d'Emballage",
      packagingDesc: "Photo de produit de luxe avec boîte",
      watermarkProt: "Protection par Filigrane",
      watermarkDesc: "Sécurité pour l'aperçu client",
      watermarkType: "Type de Filigrane",
      watermarkText: "Texte",
      watermarkLogo: "Logo",
      watermarkLabel: "Texte du Filigrane",
      productScale: "Échelle du Produit",
      tryGenerate: "Essayer de Générer",
      processing: "Traitement en cours...",
      executeBatch: "Exécuter le Lot Studio",
      generateFashion: "Générer une Campagne de Mode",
      generateAI: "Générer une Campagne IA",
      enhanceClarity: "Améliorer la Clarté",
      metals: {
        white: "Blanc",
        yellow: "Jaune",
        rose: "Rose"
      },
      stones: {
        original: "Original",
        diamond: "Diamant",
        emerald: "Émeraude",
        ruby: "Rubis",
        sapphire: "Saphir",
        amethyst: "Améthyste"
      },
      lighting: {
        catalog: "Studio Standard",
        edge: "Bord Dramatique",
        balanced: "Doux et Équilibré"
      }
    },
    fashion: {
      setup: "Configuration Mode",
      category: "Catégorie de Produit",
      productTypes: {
        ring: "Bague",
        necklace: "Collier",
        earrings: "Boucles d'oreilles"
      },
      aesthetic: "Esthétique du Mannequin",
      aesthetics: {
        editorial: "Mode Éditoriale",
        lifestyle: "Style de Vie de Luxe",
        minimal: "Portrait Minimaliste",
        "style-reference": "Référence de Style (Pose Personnalisée)"
      },
      environment: "Environnement",
      environments: {
        studio: "Studio Professionnel",
        outdoor: "Rue Parisienne",
        "luxury-interior": "Manoir Moderne",
        reference: "Env. de Référence"
      },
      skinTone: "Teint",
      hairColor: "Couleur des Cheveux",
      outfit: "Tenue",
      outfits: {
        reference: "Tenue de Référence",
        luxury: "Tenue de Luxe",
        daily: "Tenue Quotidienne"
      },
      accessory: "Accessoire Supplémentaire",
      aspectRatio: "Format d'Image",
      lifestyleCollage: "Collage Style de Vie",
      collageDesc: "Plusieurs produits en une photo",
      styleRange: "Gamme de Styles",
      styleDesc: "Fond et accessoires adaptables",
      bgColor: "Couleur de Fond:"
    },
    prompt: {
      setup: "Configuration Génération IA",
      inputType: "Type d'Entrée",
      types: {
        prompt: "Texte",
        image: "Image"
      },
      vision: "Votre Vision",
      placeholder: "Décrivez la scène...",
      styleRef: "Référence de Style",
      analyze: "Analyser l'Image",
      refDesc: "Analysez cette image",
      optimizer: "Améliorateur de Prompt",
      optimized: "Prompt Optimisé"
    },
    upscale: {
      setup: "Configuration de la Mise à l'Échelle de l'Image",
      description: "Téléchargez une image sur la droite pour améliorer sa clarté et la mettre à l'échelle en résolution 8K."
    },
    video: {
      setup: "Configuration Vidéo 360°",
      description: "Téléchargez plusieurs photos sous différents angles pour générer une vidéo 360.",
      speed: "Vitesse de Rotation",
      speeds: {
        slow: "Cinématique Lente",
        normal: "Normale",
        fast: "Vitrine Rapide"
      },
      bgColor: "Couleur de Fond"
    },
    consistency: {
      label: "Cohérence du Modèle",
      desc: "VERROUILLER L'IDENTITÉ"
    },
    profile: {
      settings: "Paramètres",
      personalInfo: "Informations Personnelles",
      registrationInfo: "Infos d'Inscription",
      changePassword: "Changer le Mot de Passe",
      profession: "Profession",
      language: "Langue",
      getHelp: "Obtenir de l'aide",
      upgradePlan: "Améliorer le forfait",
      logOut: "Déconnexion",
      proPlan: "Forfait Pro",
      credits: "Crédits Disponibles",
      pts: "PTS",
      topUp: "Recharger"
    },
    support: {
      title: "Obtenir de l'aide",
      liveSupport: "Support en direct",
      emailSupport: "Support par e-mail",
      emailDesc: "Laissez un message, nous vous répondrons",
      name: "Nom",
      email: "Adresse e-mail",
      phone: "Numéro de téléphone",
      message: "Message",
      send: "Envoyer le message",
      success: "Message envoyé avec succès!",
      aiAgent: "Assistant IA",
      aiTyping: "L'IA écrit...",
      userMessage: "Tapez votre message..."
    }
  },
  it: {
    modes: {
      retoucher: "Ritocco di Alta Gamma",
      fashion: "Moda di Lusso",
      promptToImage: "Prompt a Immagine",
      upscale: "Miglioramento dell'Immagine",
      video: "Video / 360°"
    },
    sidebar: {
      brandKit: "Kit del Brand",
      lockConfig: "Blocca Configurazione",
      locked: "Bloccato",
      brandColor: "Colore del Brand",
      bgPreference: "Preferenza Sfondo",
      configuration: "Configurazione",
      bulkMode: "Modalità di Massa",
      targetFinishes: "Finiture Desiderate",
      studioEnv: "Ambiente Studio",
      groundGloss: "Lucentezza d. Pavimento",
      catalogExport: "Esportazione Catalogo",
      jewelChanger: "Cambia Gioiello",
      packagingShot: "Modalità Confezione",
      packagingDesc: "Scatto prodotto con scatola",
      watermarkProt: "Protezione Filigrana",
      watermarkDesc: "Sicurezza anteprima",
      watermarkType: "Tipo Filigrana",
      watermarkText: "Testo",
      watermarkLogo: "Logo",
      watermarkLabel: "Testo Filigrana",
      productScale: "Scala Prodotto",
      tryGenerate: "Prova a Generare",
      processing: "Elaborazione...",
      executeBatch: "Esegui Lotto Studio",
      generateFashion: "Genera Campagna Moda",
      generateAI: "Genera Campagna IA",
      enhanceClarity: "Migliora Chiarezza",
      metals: {
        white: "Bianco",
        yellow: "Giallo",
        rose: "Rosa"
      },
      stones: {
        original: "Originale",
        diamond: "Diamante",
        emerald: "Smeraldo",
        ruby: "Rubino",
        sapphire: "Zaffiro",
        amethyst: "Ametista"
      },
      lighting: {
        catalog: "Studio Standard",
        edge: "Bordo Drammatico",
        balanced: "Bilanciato"
      }
    },
    fashion: {
      setup: "Configurazione Moda",
      category: "Categoria Prodotto",
      productTypes: {
        ring: "Anello",
        necklace: "Collana",
        earrings: "Orecchini"
      },
      aesthetic: "Estetica Modello",
      aesthetics: {
        editorial: "Alta Moda Editoriale",
        lifestyle: "Stile di Vita Lusso",
        minimal: "Ritratto Minimalista",
        "style-reference": "Riferimento Stile"
      },
      environment: "Ambiente",
      environments: {
        studio: "Studio Professionale",
        outdoor: "Strada Parigina",
        "luxury-interior": "Villa Moderna",
        reference: "Amb. di Riferimento"
      },
      skinTone: "Tonalità Pelle",
      hairColor: "Colore Capelli",
      outfit: "Abito",
      outfits: {
        reference: "Abito Riferimento",
        luxury: "Abito Lusso",
        daily: "Abito Quotidiano"
      },
      accessory: "Accessorio Aggiuntivo",
      aspectRatio: "Rapporto Aspetto",
      lifestyleCollage: "Collage Stile di Vita",
      collageDesc: "Più prodotti",
      styleRange: "Gamma di Stili",
      styleDesc: "Sfondo adattabile",
      bgColor: "Colore Sfondo:"
    },
    prompt: {
      setup: "Configurazione Gen. IA",
      inputType: "Tipo Input",
      types: {
        prompt: "Testo",
        image: "Immagine"
      },
      vision: "La tua Visione",
      placeholder: "Descrivi la scena...",
      styleRef: "Riferimento di Stile",
      analyze: "Analizza Immagine",
      refDesc: "Analizza questa immagine",
      optimizer: "Ottimizzatore Prompt",
      optimized: "Prompt Ottimizzato"
    },
    upscale: {
      setup: "Configurazione Upscale Immagine",
      description: "Carica un'immagine a destra per scalarla a risoluzione 8K."
    },
    video: {
      setup: "Configurazione Video 360°",
      description: "Carica foto da diverse angolazioni.",
      speed: "Velocità Rotazione",
      speeds: {
        slow: "Lento Cinematico",
        normal: "Normale",
        fast: "Vetrina Veloce"
      },
      bgColor: "Colore Sfondo"
    },
    consistency: {
      label: "Coerenza Modello",
      desc: "BLOCCA IDENTITÀ"
    },
    profile: {
      settings: "Impostazioni",
      personalInfo: "Informazioni Personali",
      registrationInfo: "Info Registrazione",
      changePassword: "Cambia Password",
      profession: "Professione",
      language: "Lingua",
      getHelp: "Ricevi supporto",
      upgradePlan: "Aggiorna piano",
      logOut: "Esci",
      proPlan: "Piano Pro",
      credits: "Crediti",
      pts: "PUNTI",
      topUp: "Ricarica"
    },
    support: {
      title: "Ricevi Supporto",
      liveSupport: "Supporto Live",
      emailSupport: "Supporto via E-mail",
      emailDesc: "Lascia un messaggio, ti risponderemo",
      name: "Nome",
      email: "E-mail",
      phone: "Telefono",
      message: "Messaggio",
      send: "Invia Messaggio",
      success: "Messaggio inviato!",
      aiAgent: "Assistente IA",
      aiTyping: "L'IA sta scrivendo...",
      userMessage: "Scrivi un messaggio..."
    }
  },
  es: {
    modes: {
      retoucher: "Retocador Alto Nivel",
      fashion: "Moda de Lujo",
      promptToImage: "Prompt a Imagen",
      upscale: "Mejora de Imagen",
      video: "Video / 360°"
    },
    sidebar: {
      brandKit: "Kit de Marca",
      lockConfig: "Bloquear Configuración",
      locked: "Bloqueado",
      brandColor: "Color de Marca",
      bgPreference: "Fondo",
      configuration: "Configuración",
      bulkMode: "Modo Masivo",
      targetFinishes: "Acabados Objetivo",
      studioEnv: "Entorno Estudio",
      groundGloss: "Brillo de Suelo",
      catalogExport: "Exportación (Relación)",
      jewelChanger: "Cambiar Piedras",
      packagingShot: "Modo Empaque",
      packagingDesc: "Con caja de producto",
      watermarkProt: "Protección Marca de Agua",
      watermarkDesc: "Seguridad para clientes",
      watermarkType: "Tipo Marca Agua",
      watermarkText: "Texto",
      watermarkLogo: "Logo",
      watermarkLabel: "Texto Marca Agua",
      productScale: "Escala Producto",
      tryGenerate: "Generar",
      processing: "Procesando...",
      executeBatch: "Ejecutar Lote",
      generateFashion: "Campaña Moda",
      generateAI: "Campaña IA",
      enhanceClarity: "Mejorar Claridad",
      metals: {
        white: "Blanco",
        yellow: "Amarillo",
        rose: "Rosa"
      },
      stones: {
        original: "Original",
        diamond: "Diamante",
        emerald: "Esmeralda",
        ruby: "Rubí",
        sapphire: "Zafiro",
        amethyst: "Amatista"
      },
      lighting: {
        catalog: "Estudio Estándar",
        edge: "Borde Dramático",
        balanced: "Suave Equilibrado"
      }
    },
    fashion: {
      setup: "Ajuste de Moda",
      category: "Categoría Producto",
      productTypes: {
        ring: "Anillo",
        necklace: "Collar",
        earrings: "Pendientes"
      },
      aesthetic: "Estética Modelo",
      aesthetics: {
        editorial: "Alta Costura Editorial",
        lifestyle: "Lujo Estilo Vida",
        minimal: "Retrato Minimalista",
        "style-reference": "Referencia Estilo"
      },
      environment: "Entorno",
      environments: {
        studio: "Estudio Profesional",
        outdoor: "Calle Pais",
        "luxury-interior": "Mansión",
        reference: "Entorno Ref."
      },
      skinTone: "Tono de piel",
      hairColor: "Color Pelo",
      outfit: "Vestimenta",
      outfits: {
        reference: "Referencia",
        luxury: "Lujo",
        daily: "Diario"
      },
      accessory: "Accesorio Múltiple",
      aspectRatio: "Relación de Aspecto",
      lifestyleCollage: "Collage",
      collageDesc: "Múltiples elementos",
      styleRange: "Rango Estilo",
      styleDesc: "Fondo adaptable",
      bgColor: "Color de Fondo:"
    },
    prompt: {
      setup: "Configuración IA",
      inputType: "Tipo Entrada",
      types: {
        prompt: "Texto",
        image: "Imagen"
      },
      vision: "Tu Visión",
      placeholder: "Describe la escena...",
      styleRef: "Ref. Estilo",
      analyze: "Analizar",
      refDesc: "Analizar imagen",
      optimizer: "Optimizador Prompt",
      optimized: "Prompt Optimizado"
    },
    upscale: {
      setup: "Mejorar Imagen",
      description: "Sube tu imagen."
    },
    video: {
      setup: "Video 360",
      description: "Sube imágenes.",
      speed: "Velocidad rotación",
      speeds: {
        slow: "Lento",
        normal: "Normal",
        fast: "Rápido"
      },
      bgColor: "Fondo"
    },
    consistency: {
      label: "Consistencia de Modelo",
      desc: "BLOQUEAR IDENTIDAD"
    },
    profile: {
      settings: "Configuraciones",
      personalInfo: "Información Personal",
      registrationInfo: "Información de Registro",
      changePassword: "Cambiar Contraseña",
      profession: "Profesión",
      language: "Idioma",
      getHelp: "Soporte",
      upgradePlan: "Mejorar plan",
      logOut: "Cerrar sesión",
      proPlan: "Plan Pro",
      credits: "Créditos",
      pts: "PTS",
      topUp: "Recargar"
    },
    support: {
      title: "Obtener soporte",
      liveSupport: "Soporte en vivo",
      emailSupport: "Soporte por correo electrónico",
      emailDesc: "Deja un mensaje",
      name: "Nombre",
      email: "Correo",
      phone: "Teléfono",
      message: "Mensaje",
      send: "Enviar",
      success: "¡Enviado!",
      aiAgent: "Agente IA",
      aiTyping: "Escribiendo...",
      userMessage: "Escribe mensaje..."
    }
  },
  de: {
    modes: {
      retoucher: "High-End-Retuscheur",
      fashion: "Luxusmode",
      promptToImage: "Prompt zu Bild",
      upscale: "Bild vergrößern",
      video: "Video / 360°"
    },
    sidebar: {
      brandKit: "Marken-Kit",
      lockConfig: "Konfiguration sperren",
      locked: "Gesperrt",
      brandColor: "Markenfarbe",
      bgPreference: "Hintergrund-Präferenz",
      configuration: "Konfiguration",
      bulkMode: "Stapelmodus",
      targetFinishes: "Ziel Finishes",
      studioEnv: "Studio-Umgebung",
      groundGloss: "Bodenglanz",
      catalogExport: "Katalog-Export",
      jewelChanger: "Schmuckwechsel",
      packagingShot: "Verpackungsschuss",
      packagingDesc: "Produkt mit Box",
      watermarkProt: "Wasserzeichenschutz",
      watermarkDesc: "Client-Vorschau",
      watermarkType: "Wasserzeichentyp",
      watermarkText: "Text",
      watermarkLogo: "Logo",
      watermarkLabel: "Wasserzeichen-Text",
      productScale: "Produkt skalieren",
      tryGenerate: "Generieren",
      processing: "Wird bearbeitet...",
      executeBatch: "Stapel ausführen",
      generateFashion: "Kampagne generieren",
      generateAI: "KI-Kampagne generieren",
      enhanceClarity: "Klarheit verbessern",
      metals: {
        white: "Weiß",
        yellow: "Gelb",
        rose: "Rose"
      },
      stones: {
        original: "Original",
        diamond: "Diamant",
        emerald: "Smaragd",
        ruby: "Rubin",
        sapphire: "Saphir",
        amethyst: "Amethyst"
      },
      lighting: {
        catalog: "Standard-Studio",
        edge: "Dramatisch",
        balanced: "Ausgewogen"
      }
    },
    fashion: {
      setup: "Modus-Setup",
      category: "Produktkategorie",
      productTypes: {
        ring: "Ring",
        necklace: "Halskette",
        earrings: "Ohrringe"
      },
      aesthetic: "Modell-Ästhetik",
      aesthetics: {
        editorial: "Editorial",
        lifestyle: "Lifestyle",
        minimal: "Minimalist",
        "style-reference": "Stil-Referenz"
      },
      environment: "Umgebung",
      environments: {
        studio: "Studio",
        outdoor: "Straße",
        "luxury-interior": "Villa",
        reference: "Referenz-Umb."
      },
      skinTone: "Hautfarbe",
      hairColor: "Haarfarbe",
      outfit: "Outfit",
      outfits: {
        reference: "Outfit",
        luxury: "Luxus",
        daily: "Täglich"
      },
      accessory: "Zubehör",
      aspectRatio: "Bildformat",
      lifestyleCollage: "Collage",
      collageDesc: "Mehrere Artikel",
      styleRange: "Stil-Bereich",
      styleDesc: "Hintergrund",
      bgColor: "Hintergrundfarbe:"
    },
    prompt: {
      setup: "Prompt-Einrichtung",
      inputType: "Eingabetyp",
      types: {
        prompt: "Prompt",
        image: "Bild"
      },
      vision: "Ihre Vision",
      placeholder: "Szene beschreiben...",
      styleRef: "Stil referenz",
      analyze: "Bild analysieren",
      refDesc: "Analysieren",
      optimizer: "Prompt-Optimierer",
      optimized: "Optimiert"
    },
    upscale: {
      setup: "Upscale-Einrichtung",
      description: "Laden Sie ein Bild hoch."
    },
    video: {
      setup: "360-Grad-Video",
      description: "Fotos hochladen.",
      speed: "Geschwindigkeit",
      speeds: {
        slow: "Langsam",
        normal: "Normal",
        fast: "Schnell"
      },
      bgColor: "Hintergrund"
    },
    consistency: {
      label: "Modellkonsistenz",
      desc: "ID SPERREN"
    },
    profile: {
      settings: "Einstellungen",
      personalInfo: "Persönliche Daten",
      registrationInfo: "Registrierungsinfo",
      changePassword: "Passwort ändern",
      profession: "Beruf",
      language: "Sprache",
      getHelp: "Hilfe & Support",
      upgradePlan: "Plan aktualisieren",
      logOut: "Abmelden",
      proPlan: "Pro-Plan",
      credits: "Verfügbare Kredite",
      pts: "PTS",
      topUp: "Aufladen"
    },
    support: {
      title: "Hilfe bekommen",
      liveSupport: "Live-Support",
      emailSupport: "E-Mail-Support",
      emailDesc: "Hinterlassen Sie eine Nachricht",
      name: "Name",
      email: "E-Mail",
      phone: "Telefon",
      message: "Nachricht",
      send: "Absenden",
      success: "Gesendet!",
      aiAgent: "KI Agent",
      aiTyping: "Tippen...",
      userMessage: "Nachricht eingeben..."
    }
  }
`;

translations = translations.replace("  en: {", "  " + additional.trim() + ",\n  en: {");
fs.writeFileSync('translations.ts', translations);
