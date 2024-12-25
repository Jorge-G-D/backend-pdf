const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    try {
        const { file, filename } = JSON.parse(event.body);

        if (!file || !filename) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Archivo o nombre no proporcionados.' }),
            };
        }

        // Configura el transporte de correo
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'transportedeembarcaciones@gmail.com',
                pass: 'TU_CONTRASEÑA_DE_APP',
            },
        });

        // Envía el correo con el archivo adjunto
        await transporter.sendMail({
            from: 'transportedeembarcaciones@gmail.com',
            to: 'transportedeembarcaciones@gmail.com',
            subject: 'Formulario firmado',
            text: 'Adjunto el formulario firmado por el cliente.',
            attachments: [
                {
                    filename: filename,
                    content: Buffer.from(file, 'base64'),
                },
            ],
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Correo enviado correctamente.' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error interno del servidor.' }),
        };
    }
};