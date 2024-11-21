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
            pdf.addImage(img, 'PNG', 0, 0, 210, 297);
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

            const pdf1Base64 = pdf.output('datauristring').split(',')[1];

            if (country === "Colombia") {
                // Crear segundo PDF si el país es Colombia
                const pdf2 = new jsPDF();
                const img2 = new Image();
                img2.src = 'Habeas.png'; // Cambia esta ruta por la segunda imagen

                img2.onload = async () => {
                    pdf2.addImage(img2, 'PNG', 0, 0, 210, 297);
                    pdf2.setFontSize(12);
                    pdf2.text(` ${name}`, 76, 63.5);
                    pdf2.text(` ${email}`, 43.5, 257);
                    pdf2.text(` ${address}`, 67.5, 69);
                    pdf2.text(` ${idNumber}`, 29, 74);
                    pdf2.text(` ${country}`, 50, 25);
                    pdf2.text(` ${phoneNumber}`, 37, 250);
                    pdf2.text(` ${formattedDate}`, 145, 47);

                    const signatureImage = canvas.toDataURL('image/jpeg', 0.5);
                    pdf.addImage(signatureImage, 'PNG', 25, 214, 50, 20);

                    const pdf2Base64 = pdf2.output('datauristring').split(',')[1];

                    // Enviar correo con dos PDFs adjuntos
                    await sendEmail2(email, pdf2Base64,);
                    await sendEmail1(email, pdf1Base64,);
                };

                img2.onerror = () => {
                    alert("Error al cargar la segunda imagen.");
                };
            } else {
                // Enviar correo con un solo PDF adjunto
                await sendEmail1(email, pdf1Base64, null,);
            }
        };

        img.onerror = () => {
            alert("Error al cargar la primera imagen.");
        };
    });

    async function sendEmail1(toEmail, pdf1Base64,) {
        const payload = {
            service_id: "service_rxs2p45",
            template_id: "template_m8gx2yw",
            user_id: "BguTToQAEmVYZovaF",
            template_params: {
                to_email: toEmail,
                pdf_attachment_1: pdf1Base64,
                message: "Aquí tienes tu(s) PDF generado(s).",
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
    }


    async function sendEmail2(toEmail, pdf2Base64) {
        const payload = {
            service_id: "service_rxs2p45",
            template_id: "template_1rm2hj7",
            user_id: "BguTToQAEmVYZovaF",
            template_params: {
                to_email: toEmail,
                pdf_attachment_2: pdf2Base64,
                message: "Aquí tienes tu(s) PDF generado(s).",
            },
        };

        try {
            const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert("Correo enviado  HABEAS correctamente.");
            } else {
                const errorText = await response.text();
                console.error("Error al enviar el correo:", errorText);
                alert("Hubo un error al enviar el correo.");
            }
        } catch (error) {
            console.error("Error de red:", error);
            alert("No se pudo enviar el correo.");
        }
    }
});