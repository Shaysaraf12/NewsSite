//enter as a guest or user
$(document).ready(function () {
    $("#guestLoginBtn").click(() => {
 
        alert("Welcome, Guest!");
        window.location.href = "index.html";
    });
    $("#login-form").submit(function (e) {
        e.preventDefault();

        


        const email = $("#email").val();
        const password = $("#password").val();

        const user = {
            Email: email,
            Password: password
        };

        $.ajax({
            url: "https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/User/login",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(user),
            success: function (response) {
                if (!response.isActive) {
                    alert("Your account is blocked.");
                    return;
                }

                // save in localStorage
                localStorage.setItem("userId", response.id);
                localStorage.setItem("username", response.username);
                localStorage.setItem("isAdmin", response.isAdmin);

                alert("Hello, " + response.username);
                window.location.href = "index.html"; 
            },
            error: function () {
                alert("Invalid email or password.");
            }
        });
    });

    //Login with goole
    $("#googleLoginBtn").click(() => {
        const provider = new firebase.auth.GoogleAuthProvider();

        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                const email = user.email;
                const displayName = user.displayName || email.split('@')[0];

                const userToSend = {
                    Email: email,
                    Password: ""
                };

                $.ajax({
                    url: "https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/User/Login",
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(userToSend),
                    success: function (response) {
                        // login successful
                        localStorage.setItem("userId", response.id);
                        localStorage.setItem("username", response.username);
                        localStorage.setItem("isAdmin", response.isAdmin);
                        alert("Welcome back, " + response.username);
                        window.location.href = "index.html";
                    },
                    error: function () {
                        // Google sign-in not recognized – creating new user
                        const newUser = {
                            Email: email,
                            Password: "",
                            Username: displayName,
                            IsAdmin: false
                        };

                        $.ajax({
                            url: "https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/User",
                            method: "POST",
                            contentType: "application/json",
                            data: JSON.stringify(newUser),
                            success: function () {
                                // show welcome message immediately with displayName
                                localStorage.setItem("username", displayName);
                                alert("Welcome, " + displayName);
                                window.location.href = "index.html";
                            },
                            error: function () {
                                alert("Failed to register with Google");
                            }
                        });
                    }
                });
            })
            .catch((error) => {
                console.error("Google login failed:", error);
                alert("Google login failed.");
            });
    });




});
