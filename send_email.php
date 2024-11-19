<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Configuración del correo
    $to = $_POST['email']; // Correo del destinatario
    $subject = "Formulario Enviado";
    $message = "Adjunto encontrarás tu formulario generado.";
    
    // Procesar el PDF en base64
    $pdfBase64 = $_POST['pdf'];
    $pdfContent = base64_decode(explode(',', $pdfBase64)[1]);
    $pdfFilePath = "formulario.pdf";
    file_put_contents($pdfFilePath, $pdfContent); // Guardar PDF temporalmente

    // Crear los encabezados del correo
    $boundary = md5(time());
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

    $body = "--$boundary\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $body .= $message . "\r\n";
    $body .= "--$boundary\r\n";
    $body .= "Content-Type: application/pdf; name=\"formulario.pdf\"\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n";
    $body .= "Content-Disposition: attachment; filename=\"formulario.pdf\"\r\n\r\n";
    $body .= chunk_split(base64_encode(file_get_contents($pdfFilePath))) . "\r\n";
    $body .= "--$boundary--";

    // Enviar el correo
    if (mail($to, $subject, $body, $headers)) {
        echo "Correo enviado con éxito.";
    } else {
        echo "Error al enviar el correo.";
    }

    // Eliminar archivo temporal
    unlink($pdfFilePath);
}
?>
