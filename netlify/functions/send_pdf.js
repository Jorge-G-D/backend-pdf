const nodemailer = require('nodemailer');
const fs = require('fs');
const pdfLib = require('pdf-lib'); // Para manejar la edición de PDFs
require('dotenv').config();

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    try {
      // Asegúrate de que el cuerpo de la solicitud sea JSON válido
      const body = JSON.parse(event.body);

      // Verifica que se haya enviado el campo base64PDF
      if (!body.base64PDF) {
        return {
          statusCode: 400,
          body: 'Error: El campo "base64PDF" es obligatorio.',
        };
      }

      // Maneja la cabecera "data:application/pdf;base64," si está presente
      const base64Content = body.base64PDF.startsWith('data:application/pdf;base64,')
        ? body.base64PDF.split(',')[1] // Elimina la cabecera si existe
        : body.base64PDF;

      // Decodifica el PDF Base64 y lo guarda temporalmente
      const pdfBuffer = Buffer.from(base64Content, 'base64');
      const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);

      // Opcional: Manipula el PDF si es necesario
      const modifiedPdfBytes = await pdfDoc.save();
      const tempFilePath = './uploads/formulario_completo.pdf';
      fs.writeFileSync(tempFilePath, modifiedPdfBytes);

      // Configurar transporte de nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Opciones del correo
      const mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: process.env.EMAIL_ADDRESS,
        subject: 'Nuevo formulario firmado recibido',
        text: 'Se ha recibido un nuevo formulario rellenado.',
        attachments: [
          {
            filename: 'formulario_completo.pdf',
            path: tempFilePath,
          },
        ],
      };

      // Enviar el correo
      await transporter.sendMail(mailOptions);

      return {
        statusCode: 200,
        body: 'Archivo enviado con éxito.',
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        body: `Error al procesar la solicitud: ${error.message}`,
      };
    }
  }

  return {
    statusCode: 405,
    body: 'Método no permitido.',
  };
};
