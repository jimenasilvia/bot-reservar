// test.js
console.log("🤖 Enviando mensaje de prueba a la IA...");

fetch('http://localhost:3000/api/reserva', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  // Aquí puedes cambiar el texto por lo que tú quieras para probar la mente de Gemini
  body: JSON.stringify({ 
    mensajeCliente: "Hola, quiero reservar una mesa para 4 personas este viernes a las 9 de la noche. Mi nombre es Carlos." 
  })
})
.then(res => res.json())
.then(data => {
  console.log("\n💬 Respuesta del Servidor:", data);
  console.log("\n Revisa tu Google Sheet online, ¡la magia debería estar escrita ahí!");
})
.catch(err => console.error("❌ Error en la prueba:", err));
