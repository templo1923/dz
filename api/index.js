// 1. Importar las librerías que instalamos
const express = require('express');
const cors = require('cors');
const Jimp = require('jimp');
const path = require('path');

// 2. Inicializar la aplicación de Express
const app = express();
const PORT = process.env.PORT || 3000; // El puerto donde correrá la API

// 3. Configurar los Middlewares
// CORS: Para permitir peticiones desde cualquier origen (tu frontend)
app.use(cors());
// Para que Express entienda JSON en el cuerpo de las peticiones POST
app.use(express.json());
// Para servir archivos estáticos (las imágenes generadas)
// Todo lo que esté en la carpeta 'public' será accesible desde la URL '/static'
app.use('/static', express.static(path.join(__dirname, 'public')));


// 4. Crear el Endpoint para generar el comprobante
app.post('/api/generar-comprobante', async (req, res) => {
    try {
        // Obtenemos los datos que envía el frontend
        const { nombre, numero, cuanto, tipo } = req.body;

        // Generamos un número de referencia único (puedes mejorarlo)
        const referencia = `M${Math.floor(Math.random() * 9000000) + 1000000}`;

        // --- Lógica para crear la imagen del Comprobante ---
        const plantillaComprobante = path.join(__dirname, 'templates', 'comprobante_base.png');
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK); // Cargamos una fuente
        
        const image = await Jimp.read(plantillaComprobante);

        // Escribimos los datos sobre la imagen. 
        // ¡Tendrás que ajustar las coordenadas (X, Y) para que coincidan con tu plantilla!
        image.print(font, 150, 300, nombre); // Escribe el nombre en la posición (150, 300)
        image.print(font, 150, 400, `$ ${cuanto}`); // Escribe el monto

        // Guardamos la nueva imagen
        const rutaSalidaComprobante = `public/generated/comprobante_${referencia}.jpg`;
        await image.writeAsync(rutaSalidaComprobante);

        // --- Lógica para crear la imagen de Movimientos (similar a la anterior) ---
        // (Aquí repetirías el proceso con la plantilla 'movimientos_base.png')
        // Por ahora, solo usaremos una imagen de ejemplo
        const rutaSalidaMovimientos = `public/generated/movimientos_${referencia}.png`;
        const movImage = await Jimp.read(path.join(__dirname, 'templates', 'movimientos_base.png'));
        await movImage.writeAsync(rutaSalidaMovimientos);


        // 5. Enviar la respuesta al frontend
        res.json({
            success: true,
            referencia: referencia,
            // Devolvemos las URLs relativas que el frontend puede usar
            imagen_url: `/static/generated/comprobante_${referencia}.jpg`,
            movimientos_url: `/static/generated/movimientos_${referencia}.png`
        });

    } catch (error) {
        console.error("Error generando el comprobante:", error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.' });
    }
});


// 6. Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
