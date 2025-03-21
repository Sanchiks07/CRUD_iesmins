<?php
// Database connection
require 'config.php';

// Ensure the form data is received
if (!isset($_POST['id']) || !isset($_POST['firstName']) || !isset($_POST['lastName']) || !isset($_POST['phoneNumber']) || !isset($_POST['email'])) {
    error_log('Missing required data: ' . json_encode($_POST)); // Log missing data
    echo json_encode(['success' => false, 'message' => 'Missing required data']);
    exit;
}

// Get the data from POST
$id = $_POST['id'];
$firstName = $_POST['firstName'];
$lastName = $_POST['lastName'];
$phoneNumber = $_POST['phoneNumber'];
$email = $_POST['email'];

try {
    $stmt = $pdo->prepare("UPDATE users SET first_name = ?, last_name = ?, phone_number = ?, email = ? WHERE id = ?");
    $stmt->execute([$firstName, $lastName, $phoneNumber, $email, $id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'User  updated successfully!']);
    } else {
        error_log('Update failed for ID: ' . $id); // Log the failed update
        echo json_encode(['success' => false, 'message' => 'No changes made or user not found.']);
    }
} catch (Exception $e) {
    error_log($e->getMessage()); // Log the error for debugging
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>