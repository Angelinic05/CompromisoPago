// Inicializar EmailJS
emailjs.init("BguTToQAEmVYZovaF");

document.addEventListener("DOMContentLoaded", () => {
    const { jsPDF } = window.jspdf; // Inicializar jsPDF
    const form = document.getElementById('pdfForm');
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');

    // Función para ajustar el tamaño del canvas
    const resizeCanvas = () => {
        canvas.width = canvas.clientWidth; // Ancho en píxeles
        canvas.height = canvas.clientHeight; // Altura en píxeles

        // Pintar el fondo del canvas blanco
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Ajustar el tamaño del canvas al cargar la página
    resizeCanvas();

    // Ajustar el tamaño del canvas al redimensionar la ventana
    window.addEventListener('resize', resizeCanvas);

    const clearSignatureBtn = document.getElementById('clearSignature');
    let drawing = false;

    // Funciones para manejar el dibujo
    const startDrawing = (event) => {
        drawing = true;
        draw(event);
    };

    const endDrawing = () => {
        drawing = false;
        ctx.beginPath();
    };

    const draw = (event) => {
        if (!drawing) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.type.includes("touch")
            ? event.touches[0].clientX - rect.left
            : event.clientX - rect.left;
        const y = event.type.includes("touch")
            ? event.touches[0].clientY - rect.top
            : event.clientY - rect.top;

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    // Eventos del canvas (Mouse y Táctil)
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDrawing);
    canvas.addEventListener('mouseout', endDrawing);

    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault(); // Evita que la pantalla se mueva
        startDrawing(event);
    });

    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault(); // Evita que la pantalla se mueva
        draw(event);
    });

    canvas.addEventListener('touchend', (event) => {
        event.preventDefault(); // Evita que la pantalla se mueva
        endDrawing(event);
    });

    // Limpiar firma
    clearSignatureBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Manejo del formulario
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const idNumber = document.getElementById('idNumber').value;
        const country = document.getElementById('country').value;
        const phoneNumber = document.getElementById('phone').value;

        // Obtener la fecha actual
        const today = new Date();
        const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

        // Crear PDF
        const pdf = new jsPDF();
        const img = new Image();
        img.src = 'CP5C.png';

        img.onload = async () => {
            pdf.addImage(img, 'PNG',  0, 0, 210, 297);
            pdf.setFontSize(12);
            pdf.text(` ${name}`, 76, 63.5);
            pdf.text(` ${email}`, 43.5, 257);
            pdf.text(` ${address}`, 67.5, 69);
            pdf.text(` ${idNumber}`, 29, 74);
            pdf.text(` ${country}`, 50, 25);
            pdf.text(` ${phoneNumber}`, 37, 250);
            pdf.text(` ${formattedDate}`, 145, 47); // Agregar la fecha al PDF

            const signatureImage = canvas.toDataURL('image/jpeg', 0.5);
            pdf.addImage(signatureImage, 'PNG', 25, 214, 50, 20);

            const pdfBase64 = pdf.output('datauristring').split(',')[1];

            const payload = {
                service_id: "service_rxs2p45",
                template_id: "template_m8gx2yw",
                user_id: "BguTToQAEmVYZovaF",
                template_params: {
                    to_email: email,
                    subject: "Tu formulario con PDF",
                    message: "Aquí tienes tu PDF generado desde el formulario.",
                    pdf_attachment: pdfBase64,
                },
            };

            try {
                const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    alert("Correo enviado correctamente.");
                } else {
                    const errorText = await response.text();
                    console.error("Error al enviar el correo:", errorText);
                    alert("Hubo un error al enviar el correo.");
                }
            } catch (error) {
                console.error("Error de red:", error);
                alert("No se pudo enviar el correo.");
            }
        };

        img.onerror = () => {
            alert("Error al cargar la imagen de fondo.");
        };
    });
});