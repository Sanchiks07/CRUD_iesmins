// Get buttons and sections
const createUserBtn = document.getElementById('createUserBtn');
const readUserBtn = document.getElementById('readUserBtn');
const uploadFileBtn = document.getElementById('uploadFileBtn');
const createUserSection = document.getElementById('createUserSection');
const readUserSection = document.getElementById('readUserSection');
const uploadFileSection = document.getElementById('uploadFileSection');

// Toggle sections when menu items are clicked
createUserBtn.addEventListener('click', () => {
    createUserSection.style.display = 'block';
    readUserSection.style.display = 'none';
    uploadFileSection.style.display = 'none';
});

readUserBtn.addEventListener('click', async () => {
    createUserSection.style.display = 'none';
    uploadFileSection.style.display = 'none';
    readUserSection.style.display = 'block';

    // Load users when the Read User section is displayed
    await loadUsers();
});

uploadFileBtn.addEventListener('click', () => {
    createUserSection.style.display = 'none';
    readUserSection.style.display = 'none';
    uploadFileSection.style.display = 'block';
});

// Handle user form submission for creating a new user
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    let formData = new FormData();
    formData.append("firstName", document.getElementById('firstName').value);
    formData.append("lastName", document.getElementById('lastName').value);
    formData.append("phoneNumber", document.getElementById('phoneNumber').value);
    formData.append("email", document.getElementById('email').value);
    formData.append("password", document.getElementById('password').value);

    try {
        let response = await fetch("create_user.php", {
            method: "POST",
            body: formData
        });

        let result = await response.json();
        console.log("Server response:", result);

        if (result.success) {
            alert(result.message);

            document.getElementById('createUserSection').style.display = 'none';
            document.getElementById('uploadFileSection').style.display = 'none';
            document.getElementById('readUserSection').style.display = 'block';

            await loadUsers();

        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error creating user:", error);
        alert("There was an error creating the user. Please try again.");
    }
});

// Function to load and display users
async function loadUsers() {
    try {
        let response = await fetch("read_users.php");
        let users = await response.json();

        let readSection = document.getElementById('readUserSection');
        readSection.innerHTML = "<h2>Users List</h2>";

        if (users.length > 0) {
            let table = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Phone Number</th>
                            <th>Email</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            users.forEach(user => {
                table += `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.first_name}</td>
                        <td>${user.last_name}</td>
                        <td>${user.phone_number}</td>
                        <td>${user.email}</td>
                        <td>
                            <button class="edit-btn">Edit</button>
                            <button class="delete-btn">Delete</button>
                        </td>
                    </tr>
                `;
            });

            table += `</tbody></table>`;
            readSection.innerHTML += table;
        } else {
            readSection.innerHTML += "<p>No users found in our DB</p>";
        }

        // Make sure the sections are displayed correctly
        createUserSection.style.display = 'none';
        readUserSection.style.display = 'block';

        // Set up edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function () {
                let row = this.closest('tr');
                let user = {
                    id: row.children[0].textContent,
                    first_name: row.children[1].textContent,
                    last_name: row.children[2].textContent,
                    phone_number: row.children[3].textContent,
                    email: row.children[4].textContent
                };
                openEditPopup(user);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function () {
                let row = this.closest('tr');
                let id = row.children[0].textContent;
                confirmDeleteUser(id);
            });
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        alert("There was an error fetching users. Please try again.");
    }
}

// Function to open the edit popup
function openEditPopup(user) {
    let existingPopup = document.getElementById('editPopup');
    if (existingPopup) existingPopup.remove();

    let popup = document.createElement('div');
    popup.id = 'editPopup';
    popup.innerHTML = `
        <div id="editPopup">
            <div class="popup-content">
                <h2>Edit User</h2>
                <form id="editUserForm">
                    <input type="hidden" id="editId" value="${user.id}">
                    <div class="edit-input-group">
                        <input type="text" id="editFirstName" value="${user.first_name}" required>
                        <label for="editFirstName">First Name</label>
                    </div>
                    <div class="edit-input-group">
                        <input type="text" id="editLastName" value="${user.last_name}" required>
                        <label for="editLastName">Last Name</label>
                    </div>
                    <div class="edit-input-group">
                        <input type="text" id="editPhoneNumber" value="${user.phone_number}" required>
                        <label for="editPhoneNumber">Phone Number</label>
                    </div>
                    <div class="edit-input-group">
                        <input type="email" id="editEmail" value="${user.email}" required>
                        <label for="editEmail">Email</label>
                    </div>

                    <button class="save-close-btn" type="button" onclick="saveUserChanges()">Save Changes</button>
                    <button class="save-close-btn" type="button" onclick="closeEditPopup()">Cancel</button>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
}

// Function to close the edit popup
function closeEditPopup() {
    let popup = document.getElementById('editPopup');
    if (popup) popup.remove();
}

// Function to save the changes made to a user
async function saveUserChanges() {
    let id = document.getElementById('editId').value;
    let firstName = document.getElementById('editFirstName').value;
    let lastName = document.getElementById('editLastName').value;
    let phoneNumber = document.getElementById('editPhoneNumber').value;
    let email = document.getElementById('editEmail').value;

    let formData = new FormData();
    formData.append("id", id);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("phoneNumber", phoneNumber);
    formData.append("email", email);

    try {
        let response = await fetch("update_user.php", {
            method: "POST",
            body: formData
        });

        let result = await response.json();
        console.log(result);

        if (result.success) {
            alert("User updated successfully!");
            closeEditPopup();
            await loadUsers();
        } else {
            alert("Error updating user: " + result.message);
        }
    } catch (error) {
        console.error("Update failed:", error);
        alert("There was an error updating the user. Please try again.");
    }
}

// Function to confirm deletion of a user
async function confirmDeleteUser(id) {
    let confirmation = confirm("Are you sure you want to delete this user?");
    if (confirmation) {
        try {
            let formData = new FormData();
            formData.append("id", id);

            let response = await fetch("delete_user.php", {
                method: "POST",
                body: formData
            });

            let result = await response.json();
            if (result.success) {
                alert("User deleted successfully!");
                await loadUsers();
            } else {
                alert("Error deleting user: " + result.message);
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert("There was an error deleting the user. Please try again.");
        }
    }
}

// Upload Files script
document.querySelector(".upload-btn").addEventListener("click", function() {
    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch("upload_file.php", {
        method: "POST",
        body: formData,
    })
        .then(response => response.json()) // This will parse the JSON response
        .then(data => {
            if (data.success) {
                alert("File uploaded successfully.");
            } else {
                alert("File upload failed: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error uploading file:", error);
            alert("There was an error uploading the file.");
        });    
});
