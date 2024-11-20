// Inicializar EmailJS
emailjs.init("BguTToQAEmVYZovaF");

document.addEventListener("DOMContentLoaded", () => {
    const { jsPDF } = window.jspdf; // Inicializar jsPDF
    const form = document.getElementById('pdfForm');
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');

    // Pintar el fondo del canvas blanco
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const clearSignatureBtn = document.getElementById('clearSignature');
    let drawing = false;

    // Habilitar dibujo para dispositivos de escritorio
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
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';

        let x, y;
        if (event.type.includes("touch")) {
            const touch = event.touches[0];
            x = touch.clientX - rect.left;
            y = touch.clientY - rect.top;
        } else {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        }

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDrawing);
    canvas.addEventListener('mouseout', endDrawing);

    // Habilitar dibujo para dispositivos táctiles
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', endDrawing);

    // Limpiar la firma
    clearSignatureBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Manejar el envío del formulario
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const idNumber = document.getElementById('idNumber').value;

        // Crear PDF con Imagen de Fondo
        const pdf = new jsPDF();
        const img = new Image();
        img.src = 'CP5C.png';

        img.onload = async () => {
            pdf.addImage(img, 'PNG', 0, 0, 210, 297); // Añadir imagen de fondo
            pdf.setFontSize(12);
            pdf.text(` ${name}`, 75, 62);
            pdf.text(` ${email}`, 10, 240);
            pdf.text(` ${address}`, 69, 69);
            pdf.text(` ${idNumber}`, 25, 73);

            // Añadir firma al PDF
            const signatureImage = canvas.toDataURL('image/jpeg', 0.5);
            pdf.addImage(signatureImage, 'PNG', 25, 214, 50, 20);

            // Convertir PDF a base64
            const pdfBase64 = pdf.output('datauristring').split(',')[1];

            // Configurar datos para enviar a EmailJS
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
