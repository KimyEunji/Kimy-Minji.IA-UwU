const xdata = {
    preguntas: [
        { id: '1', pregunta: 'Hola', respuesta: 'Hola ¿Cómo estás?' },
        // Agrega más entradas según sea necesario
    ],
    horario: {
        lunes: { inicio: '09:00', fin: '17:00' },
        martes: { inicio: '09:00', fin: '17:00' },
        miércoles: { inicio: '09:00', fin: '17:00' },
        jueves: { inicio: '09:00', fin: '17:00' },
        viernes: { inicio: '09:00', fin: '17:00' },
        sábado: { inicio: '10:00', fin: '14:00' },
        domingo: { inicio: 'cerrado', fin: 'cerrado' },
    },
    citas: []
};

module.exports = xdata;
