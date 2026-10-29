import { GoogleGenAI } from '@google/genai';

// Inicializamos la Inteligencia Artificial usando tu clave del archivo .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  // Configuración de permisos para pruebas locales (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

  try {
    // 1. Recibir el mensaje de texto que el cliente escribió en tu landing page
    const { mensajeCliente } = req.body; 

    // 2. Darle instrucciones estrictas a Gemini (System Instructions)
    const promptSistema = `
      Eres el asistente de reservas de un restaurante. Tu único objetivo es extraer los datos de la reserva del mensaje del usuario.
      Debes responder ÚNICAMENTE con un objeto JSON válido con este formato, sin textos adicionales, sin comillas de bloque (\`\`\`) ni formato markdown:
      {"nombre": "Nombre si lo da o null", "telefono": "Telefono si lo da o null", "fecha": "AAAA-MM-DD", "hora": "HH:MM", "personas": número}
      La fecha actual de referencia es: 2026-08-26.
    `;

    // 3. Llamar al modelo rápido y gratuito Gemini 2.5 Flash
    const respuestaIA = await ai.models.generateContent({
      model: "gemini-3.5-flash",//'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: promptSistema }] },
        { role: 'user', parts: [{ text: `Mensaje del cliente: "${mensajeCliente}"` }] }
      ]
    });

    // 4. Limpiar y convertir la respuesta de Gemini en un objeto de JavaScript
    const textoLimpio = respuestaIA.text.trim();
    console.log("🧠 [3/4] Gemini respondió esto:", textoLimpio);
    const datosReserva = JSON.parse(textoLimpio);

    // 5. Si Gemini logró extraer fecha, hora y personas, mandamos los datos a Google Sheets
    if (datosReserva.fecha && datosReserva.hora && datosReserva.personas) {
      datosReserva.apiKey = process.env.API_SECRET_KEY; // Inyectamos tu contraseña inventada de seguridad
 console.log("📡 [4/4] Enviando paquete a Google Sheets... URL:", process.env.GOOGLE_SCRIPT_URL);
      await fetch(process.env.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosReserva)
      });

      return res.status(200).json({ 
        status: 'success', 
        respuestaBot: `¡Perfecto! He agendado tu mesa para ${datosReserva.personas} personas el día ${datosReserva.fecha} a las ${datosReserva.hora}.` 
      });
    } else {
      // Si faltan datos (por ejemplo, el cliente no dijo la hora), le pedimos que continúe la conversación
      return res.status(200).json({ 
        status: 'incomplete', 
        respuestaBot: "Entendido, ¿para qué fecha y hora te gustaría agendar tu mesa y para cuántas personas?" 
      });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}