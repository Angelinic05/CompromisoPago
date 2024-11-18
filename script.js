import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-storage.js";

// Configura Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD_zE2J39gRAobpdtkaN147a9alCvz4LW",
    authDomain: "carterala-60c56.firebaseapp.com",
    projectId: "carterala-60c56",
    storageBucket: "carterala-60c56.firebasestorage.app",
    messagingSenderId: "1045255578260",
    appId: "1:1045255578260:web:631af3b83198ab6d7e4a81",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Inicializa EmailJS
emailjs.init("1fTlnJ6lWrRKXSSki");

document.addEventListener("DOMContentLoaded", () => {
    // Captura los elementos del DOM
    const signaturePad = new SignaturePad(document.getElementById("signature-pad"));
    const clearButton = document.getElementById("clear-signature");
    const generatePDFButton = document.getElementById("generate-pdf");
    const sendEmailButton = document.getElementById("send-email");

    let pdfBlob = null; // Variable para almacenar el PDF generado

    // Función para limpiar la firma
    clearButton.addEventListener("click", () => {
        signaturePad.clear();
    });

    // Función para generar el PDF
    generatePDFButton.addEventListener("click", () => {
        const name = document.getElementById("name").value;
        const userId = document.getElementById("user_id").value;
        const address = document.getElementById("address").value;

        if (!name || !userId || !address || signaturePad.isEmpty()) {
            alert("Por favor completa todos los campos y firma.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        const img = new Image();
        img.src = "COMPROBANTE DE PAGO5.jpg"; // Ruta de tu imagen base

        img.onload = () => {
            pdf.addImage(img, "JPEG", 10, 10, 190, 277);
            pdf.setFontSize(12);
            pdf.text(`Nombre: ${name}`, 20, 50);
            pdf.text(`ID: ${userId}`, 20, 70);
            pdf.text(`Dirección: ${address}`, 20, 90);

            const signatureData = signaturePad.toDataURL("image/png");
            pdf.addImage(signatureData, "PNG", 20, 110, 50, 20);

            // Generar PDF como Blob
            pdfBlob = pdf.output("blob");
            alert("PDF generado correctamente.");
        };
    });

    // Función para subir el PDF a Firebase y enviar el correo
    sendEmailButton.addEventListener("click", async () => {
        if (!pdfBlob) {
            alert("Por favor, genera primero el PDF antes de enviarlo.");
            return;
        }

        try {
            // Subir archivo a Firebase Storage
            const storageRef = storage.ref(`pdfs/compromiso_pago_${Date.now()}.pdf`);
            const uploadTask = await storageRef.put(pdfBlob);
            const downloadURL = await uploadTask.ref.getDownloadURL();

            // Enviar correo con enlace al archivo
            emailjs
                .send("service_zsnah7g", "template_09hljc7", {
                    from_name: "Formulario Web",
                    to_name: "Usuario",
                    message: `Puedes descargar tu documento aquí: ${downloadURL}`,
                })
                .then(() => {
                    alert("Correo enviado exitosamente con el enlace al archivo.");
                })
                .catch((error) => {
                    console.error("Error al enviar el correo:", error);
                    alert("Hubo un error al enviar el correo.");
                });
        } catch (error) {
            console.error("Error al subir el archivo:", error);
            alert("Hubo un error al subir el archivo a Firebase.");
        }
    });
});
