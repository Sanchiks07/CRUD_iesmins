<?php
require 'config.php';

if (isset($_FILES['file'])) {
    $file = $_FILES['file'];

    $fileName = basename($file['name']);
    $fileTmpName = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileError = $file['error'];
    $fileType = $file['type'];

    if ($fileError !== 0) {
        echo json_encode(['success' => false, 'message' => 'There was an error uploading the file.']);
        exit;
    }

    // Generate a unique name for the file
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $newFileName = uniqid('', true) . '.' . $fileExtension;
    $uploadDirectory = 'uploads/';

    // Ensure the upload directory exists
    if (!is_dir($uploadDirectory)) {
        mkdir($uploadDirectory, 0777, true);
    }

    // Move the uploaded file to the uploads directory
    $fileDestination = $uploadDirectory . $newFileName;

    if (move_uploaded_file($fileTmpName, $fileDestination)) {
        $filePath = $fileDestination;

        $stmt = $conn->prepare("INSERT INTO files (file_path) VALUES (:file_path)");
        $stmt->bind_param("s", $filePath);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'File uploaded successfully.', 'filePath' => $filePath]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error saving file path to the database.']);
        }

        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'There was an error moving the uploaded file.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'No file was uploaded.']);
}
?>
