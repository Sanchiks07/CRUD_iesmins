<?php
require 'config.php';

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (isset($_FILES['file'])) {
    $file = $_FILES['file'];

    $fileName = basename($file['name']);
    $fileTmpName = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileError = $file['error'];
    $fileType = $file['type'];

    // Check for upload errors
    if ($fileError !== 0) {
        echo json_encode(['success' => false, 'message' => 'Error uploading the file. Error Code: ' . $fileError]);
        exit;
    }

    // Generate a unique name for the file
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $newFileName = uniqid('', true) . '.' . $fileExtension;
    $uploadDirectory = 'uploads/';

    // Ensure the upload directory exists and is writable
    if (!is_dir($uploadDirectory)) {
        mkdir($uploadDirectory, 0777, true);
    }

    if (!is_writable($uploadDirectory)) {
        echo json_encode(['success' => false, 'message' => 'Upload directory is not writable.']);
        exit;
    }

    // Move the uploaded file to the uploads directory
    $fileDestination = $uploadDirectory . $newFileName;

    if (move_uploaded_file($fileTmpName, $fileDestination)) {
        // File uploaded successfully
        $filePath = $fileDestination;

        // Prepare the SQL statement to insert the file path into the database
        $stmt = $conn->prepare("INSERT INTO files (file_path) VALUES (?)");

        if ($stmt === false) {
            echo json_encode(['success' => false, 'message' => 'Error preparing the SQL statement: ' . $conn->error]);
            exit;
        }

        // Bind the file path as a parameter and execute the statement
        $stmt->bind_param("s", $filePath);

        // Execute the statement
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'File uploaded successfully.', 'filePath' => $filePath]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error saving file path to the database: ' . $stmt->error]);
        }

        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Error moving the uploaded file.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'No file was uploaded.']);
}
?>