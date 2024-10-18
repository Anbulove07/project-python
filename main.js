let allUsers = [];  // To store the full user list

// Function to create user table rows dynamically
function createUserTable(users) {
    const table = document.getElementById("userTable");

    // Clear existing rows (except the header row)
    table.innerHTML = `
        <tr>
            <th>Name</th>
            <th>ID</th>
            <th>Mobile</th>
            <th>Grade</th>
            <th>Status</th>
            <th>Remarks</th>
        </tr>
    `;

    users.forEach(user => {
        const row = table.insertRow();
        row.insertCell(0).innerText = user.name; // Name
        row.insertCell(1).innerText = user.id; // ID
        const mobileCell = row.insertCell(2);
        mobileCell.innerHTML = `<input type="text" value="${user.mobile}" />`; // Editable mobile number
        row.insertCell(3).innerText = user.grade; // Grade

        const statusCell = row.insertCell(4);
        // Create radio buttons for status
        statusCell.innerHTML = `
            <label><input type="radio" name="status_${user.id}" value="Present"> Present</label>
            <label><input type="radio" name="status_${user.id}" value="Absent"> Absent</label>
            <label><input type="radio" name="status_${user.id}" value="Late"> Late</label>
        `;

        const remarksCell = row.insertCell(5);
        remarksCell.innerHTML = `<textarea rows="3" cols="30" placeholder="Enter remarks..."></textarea>`;
    });
}

// Function to filter users by grade
function filterByGrade() {
    const selectedGrade = document.getElementById("gradeFilter").value;

    if (selectedGrade === "All") {
        createUserTable(allUsers);  // Show all users if "All" is selected
    } else {
        const filteredUsers = allUsers.filter(user => user.grade === selectedGrade);
        createUserTable(filteredUsers);  // Show filtered users based on the selected grade
    }
}

// Function to gather the selected statuses and send the full list to Python
function updateUserStatus() {
    let table = document.getElementById("userTable");
    let rows = table.getElementsByTagName("tr");
    let userStatusList = [];
    let allValid = true;  // Flag to check if all rows have a valid selection

    for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
        let row = rows[i];
        let name = row.cells[0].innerText;
        let id = row.cells[1].innerText;
        let mobile = row.cells[2].getElementsByTagName("input")[0].value; // Get mobile number
        let grade = row.cells[3].innerText;  // Get grade
        let status = "";
        let remarks = row.cells[5].getElementsByTagName("textarea")[0].value; // Get remarks from textarea

        // Find the selected status from radio buttons
        let radios = row.cells[4].getElementsByTagName("input");
        for (let j = 0; j < radios.length; j++) {
            if (radios[j].checked) {
                status = radios[j].value;
                break;
            }
        }

        // If no radio button is selected, mark as invalid
        if (!status) {
            alert(`Please select a status for ${name}`);
            allValid = false;  // Stop the update if any row is invalid
            break;
        }

        // Push user data into the userStatusList
        userStatusList.push({
            name: name,
            id: parseInt(id),
            mobile: mobile, // Include mobile number in the object
            grade: grade,   // Include grade in the object
            status: status,
            remarks: remarks || "" // Pass the remarks to Python
        });
    }

    // If all rows have a valid selection, proceed with the update
    if (allValid) {
        // Show loading message
        document.getElementById("loadingMessage").style.display = "block";

        eel.update_status_list(userStatusList)().then((response) => {
            // Hide loading message
            document.getElementById("loadingMessage").style.display = "none";
            // Show alert on successful SMS sending
            alert("Status updated and SMS sent successfully!");
        }).catch((error) => {
            // Hide loading message
            document.getElementById("loadingMessage").style.display = "none";
            alert("Error updating status: " + error);
        });
    }
}

// Call Python to get the user list and populate the table
eel.get_user_list()(function(users) {
    allUsers = users;  // Store the full user list
    createUserTable(allUsers);  // Create the table initially
});