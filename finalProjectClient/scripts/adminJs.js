
// Fetch users

$(document).ready(function () {
    $.get("https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/User", function (users) { 
        users.forEach(user => {
            const statusText = user.isActive ? "Active" : "Deactive";

            const row = `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${statusText}</td>
                <td>
                    ${user.username.toLowerCase() !== "admin" ? `
                     <button class="status-btn" onclick="toggleUser(${user.id}, ${!user.isActive}, '${user.username}', '${user.email}', '${user.password}')">
                            Change Status
                        </button>` : ""}

                </td>
            </tr>`;
            $("#usersTableBody").append(row);
        });
    });

    //article saved count
    $.get("https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/SavedArticles/admin/saved-today", function (data) { 

        $("#totalCount").text(data.total);

        let rows = "";
        data.articles.forEach(function (item) {
            rows += `<tr>
                            <td>${item.title}</td>
                            <td>${item.count}</td>
                         </tr>`;
        });

        $("#articlesTable tbody").html(rows);
    });



     // Shows deleted articles

    $("#show-deleted-btn").on("click", function () {
        $.get("https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/Article/deleted", function (articles) {
            const container = $("#deleted-articles-container");
            container.empty();

            if (articles.length === 0) {
                container.append("<p>אין כתבות שנמחקו.</p>");
                return;
            }

            articles.forEach(article => {
                const card = $(`
                <div class="article-card" data-id="${article.id}">
                    <h3>${article.title}</h3>
                    <button class="restore-btn">שחזר</button>
                </div>
            `);
                container.append(card);
            });
        }).fail(function (xhr, status, error) {
            console.error("שגיאה בבקשה לשרת:", status, error);
        });
    });

    //Restore deleted articles

    $(document).on("click", ".restore-btn", function () {
        const articleId = $(this).closest(".article-card").data("id");

        $.ajax({
            url: `https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/Article/restore/${articleId}`,
            type: "PUT",
            success: function () {
                alert(" The article has been restored.!");
                $(`.article-card[data-id='${articleId}']`).remove();
            },
            error: function () {
                alert("Error retrieving article");

            }
        });
    });

    //add comment window
   
    $("#add-article-btn").on("click", function () {
        $("#add-article-modal").show();
    });
    $(document).on("keydown", function (e) {
        if (e.key === "Escape") {
            $("#add-article-modal").hide();
        }
    });

    
    // add article form
    $("#addArticleForm").on("submit", function (e) {
        e.preventDefault();

        const article = {
            title: $("#titleTB").val(),
            description: $("#descriptionTB").val(),
            url: $("#urlTB").val(),
            urlToImage: $("#imageTB").val(),
            publishedAt: $("#publishedAtTB").val(),
            source: { name: $("#sourceTB").val() },
            content: $("#contentTB").val(),
            author: $("#authorTB").val()
        };

        $.ajax({
            url: "https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/Article",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(article),
            success: function () {
                alert(" Article added successfully");
                $("#addArticleForm")[0].reset();
                $("#add-article-modal").hide();
            },
            error: function () {
                alert(" Failed to add article");
            }
        });
    });


    

            
  });



// update status
function toggleUser(id, newStatus, username, email, password) { 
    $.ajax({
        url: "https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/User/" + id + "/status",
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify({
            Id: id,
            Username: username,
            Email: email,
            Password: password,
            IsActive: newStatus
        }),
        success: function () {
            alert("Status updated");
            location.reload();
        },
        error: function () {
            alert("Error updating user");
        }
    });
}
// login log day
$.get("https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/User/logins/today", function (count) {  
    $("#login-count").text(count);
});

// news pull count
function getPullCount() {
    $.get("https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/Article/pull-count", function (data) { 
        $("#pull-count-result").text("✅ כמות משיכות: " + data);
    }).fail(function () {
        $("#pull-count-result").text("❌ שגיאה בקבלת הנתון.");
    });
}



// report button and reason

$("#loadReportsBtn").click(function () {
    db.collection("SharedArticles")
        .where("reported", "==", true)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                $("#reportsTableContainer").html("<p>אין דיווחים כרגע.</p>");
                return;
            }

            let table = `
        <table border="1" cellpadding="10">
          <thead>
            <tr>
              <th>שם משתמש</th>
              <th>כותרת</th>
              <th>סיבת דיווח</th>
              <th>סטטוס</th>
            </tr>
          </thead>
          <tbody>
      `;

            snapshot.forEach(doc => {
                const data = doc.data();
                const status = data.reportHandled ? "✅ טופל" : "❌ לא טופל";
                table += `
          <tr data-id="${doc.id}">
            <td>${data.sharedBy}</td>
            <td>${data.title}</td>
            <td>${data.reportReason || "-"}</td>
            <td>
              <button class="toggle-status-btn">${status}</button>
            </td>
          </tr>
        `;
            });

            table += "</tbody></table>";
            $("#reportsTableContainer").html(table);
        })
        .catch(err => {
            console.error("שגיאה בטעינת דיווחים", err);
        });
});

//update staus -active//deactive
$(document).on("click", ".toggle-status-btn", function () {
    const row = $(this).closest("tr");
    const docId = row.data("id");
    const button = $(this);
    const isHandled = button.text().includes("✅");

    const newStatus = !isHandled;

    db.collection("SharedArticles").doc(docId).update({
        reportHandled: newStatus
    }).then(() => {
        button.text(newStatus ? "✅ טופל" : "❌ לא טופל");

        if (newStatus) {
            button.addClass("handled");
        } else {
            button.removeClass("handled");
        }
    }).catch(err => {
        console.error("שגיאה בעדכון סטטוס דיווח", err);
        alert("שגיאה בעדכון");
    });
});



