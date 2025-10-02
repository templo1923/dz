const express = require('express');
const cors = require('cors');
const Jimp = require('jimp');
const path = require('path');

// Esta línea es necesaria para que Vercel sirva la API correctamente
const app = express();

app.use(cors());
app.use(express.json());

// La API ahora es la función que se exporta
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Método no permitido' });
    }

    try {
        const { nombre, numero, cuanto, tipo } = req.body;
        const referencia = `M${Math.floor(Math.random() * 9000000) + 1000000}`;

        // --- Lógica para COMPROBANTE ---
        const plantillaComprobantePath = path.join(process.cwd(), 'public', 'templates', 'comprobante_base.png');
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        const image = await Jimp.read(plantillaComprobantePath);
        
        // AJUSTA ESTAS COORDENADAS (X, Y) PARA TU PLANTILLA
        image.print(font, 150, 300, nombre);
        image.print(font, 150, 400, `$ ${cuanto}`);

        // Convertir la imagen a Base64 en lugar de guardarla
        const imagen_base64 = await image.getBase64Async(Jimp.MIME_PNG);

        // --- Lógica para MOVIMIENTOS ---
        const plantillaMovimientosPath = path.join(process.cwd(), 'public', 'templates', 'movimientos_base.png');
        const movImage = await Jimp.read(plantillaMovimientosPath);
        
        // Aquí también podrías escribir texto si lo necesitas
        // movImage.print(font, X, Y, "algún texto");

        const movimientos_base64 = await movImage.getBase64Async(Jimp.MIME_PNG);

        // Enviar la respuesta con los datos de las imágenes en Base64
        res.status(200).json({
            success: true,
            referencia: referencia,
            imagen_base64: imagen_base64,
            movimientos_base64: movimientos_base64
        });

    } catch (error) {
        console.error("Error generando el comprobante:", error);
        res.status(500).json({ success: false, message: 'Error interno del servidor.', error: error.message });
    }
};
