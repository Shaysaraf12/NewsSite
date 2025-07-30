

// User registration
$(document).ready(function () {
    $("#register-form").submit(function (e) {
        e.preventDefault(); // prevent refresh

        const username = $("#username").val();
        const email = $("#email").val();
        const password = $("#password").val();
        const confirmPassword = $("#confirmPassword").val();

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        // validate password: min 8 chars, at least one uppercase and one digit
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            alert("Password must be at least 8 characters long, include one uppercase letter and one number.");
            return;
        }

        // validate username: at least 2 letters
        if (!/^[A-Za-z]{2,}/.test(username)) {
            alert("Username must be at least 2 letters.");
            return;
        }


        const user = {
            Username: username,
            Email: email,
            Password: password
        };

        $.ajax({
            url: "https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/User", 
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(user),
            success: function () {
                alert("Registration successful!");
                window.location.href = "login.html";
            },
            error: function (xhr) {
                alert("Registration failed: " + xhr.responseText);
            }
        });
    });
});
