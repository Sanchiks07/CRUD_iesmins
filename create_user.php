<?php
require 'config.php'; // Include DB connection

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $first_name = $_POST['firstName'] ?? '';
    $last_name = $_POST['lastName'] ?? '';
    $phone_number = $_POST['phoneNumber'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    $hash_password = password_hash($password, PASSWORD_DEFAULT);

    if (!empty($first_name) && !empty($last_name) && !empty($phone_number) && !empty($email) && !empty($password)) {
        try {
            $stmt = $pdo->prepare("INSERT INTO users (first_name, last_name, phone_number, email, password) VALUES (:first_name, :last_name, :phone_number, :email, :password)");
            $stmt->bindParam(':first_name', $first_name);
            $stmt->bindParam(':last_name', $last_name);
            $stmt->bindParam(':phone_number', $phone_number);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $hash_password);

            $stmt->execute();

            // Return a JSON response with a redirect URL
            echo json_encode(["success" => true, "message" => "User created successfully", "redirect" => "read_users.php"]);
        } catch (PDOException $e) {
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "All fields are required."]);
    }
}
?>
