// script.js
document.addEventListener("DOMContentLoaded", () => {
    const signaturePad = new SignaturePad(document.getElementById("signature-pad"));
    const clearButton = document.getElementById("clear-signature");
    const generatePDFButton = document.getElementById("generate-pdf");

    clearButton.addEventListener("click", () => {
        signaturePad.clear();
    });

    generatePDFButton.addEventListener("click", () => {
        // Capturar los valores del formulario
        const name = document.getElementById("name").value;
        const userId = document.getElementById("user_id").value;
        const address = document.getElementById("address").value;

        if (!name || !userId || !address || signaturePad.isEmpty()) {
            alert("Por favor completa todos los campos y firma.");
            return;
        }

        // Crear el PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        // Agregar la imagen de plantilla
        const img = new Image();
        img.src = "COMPROMISO DE PAGO5.jpg";
        img.onload = () => {
            pdf.addImage(img, "JPEG", 10, 10, 190, 277);

            // Agregar texto
            pdf.setFontSize(12);
            pdf.text(`Nombre: ${name}`, 20, 50);
            pdf.text(`ID: ${userId}`, 20, 70);
            pdf.text(`Dirección: ${address}`, 20, 90);

            // Agregar firma
            const signatureData = signaturePad.toDataURL("image/png");
            pdf.addImage(signatureData, "PNG", 20, 110, 50, 20);

            // Descargar el PDF
            pdf.save("compromiso_pago.pdf");
        };
    });
});
