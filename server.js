import http from 'http';
import handler from './api/reserva.js';

const server = http.createServer(async (req, res) => {
  // Leer los datos que vienen del test.js
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  
  req.on('end', async () => {
    try {
      req.body = body ? JSON.parse(body) : {};
    } catch (e) {
      req.body = {};
    }
    
    // Simulamos las funciones que usa Vercel para responder
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { 
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data)); 
    };

    // Ejecutamos tu API de Gemini y Google
    await handler(req, res);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor nativo corriendo en http://localhost:${PORT}`);
});
