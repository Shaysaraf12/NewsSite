let currentShareIdToReport = null;  // global

 // Load shares from Firebase

$(document).ready(function () {
                                                     
    
        const myUserId = localStorage.getItem("userId");
        if (!myUserId) {
            alert("Please login first.");
            window.location.href = "login.html"; // מעבר לעמוד ההתחברות

            return;
        }

        // 1. שלוף את רשימת החסומים
        db.collection("Blocked")
            .doc(myUserId)
            .collection("Users")
            .get()
            .then(blockedSnapshot => {
                const blockedIds = blockedSnapshot.docs.map(doc => doc.id);

                // 2. טען את השיתופים
                db.collection("SharedArticles")
                    .orderBy("createdAt", "desc")
                    .get()
                    .then(snapshot => {
                        snapshot.forEach(doc => {
                            const data = doc.data();

                            // 3. אם המשתמש שחסמתי שיתף – דלג
                            if (blockedIds.includes(data.userId)) return;

                            const card = `
                            <div class="shared-card" data-share-id="${doc.id}" data-shared-user-id="${data.userId}">
                            <div class="shared-by">${data.sharedBy} כתב:</div>
                            <div class="comment">"${data.comment}"</div>
                            <h3>${data.title}</h3>
                            <p>${data.description}</p>
                            ${data.image ? `<img src="${data.image}" alt="תמונה">` : ""}
                            <br/>
                            <a href="${data.url}" target="_blank">📖 קרא את הכתבה</a>
                            <br/><br/>
                            <button class="report-btn">⚠ דווח</button>
                            ${data.userId === myUserId ? `<button class="delete-share-btn green-btn">🗑️ מחק</button>` : ""}

                            <button class="block-user-btn">🚫 חסום</button>
                              <button class="toggle-comments-btn">💬 תגובות</button>
                                 <div class="comments-section" style="display: none;">
                                  <ul class="comment-list"></ul>
                                  <input type="text" class="comment-input" placeholder="כתוב תגובה..." />
                                <button class="add-shared-comment-btn">שלח תגובה</button>
                                </div>
                          </div>
                        `;

                            $("#sharesContainer").append(card);
                        });
                    })
                    .catch(err => {
                        console.error("שגיאה בטעינת שיתופים", err);
                    });
            })
            .catch(err => {
                console.error("שגיאה בטעינת חסומים", err);
            });
    

});



// report button/
$(document).on("click", ".report-btn", function () {
    const card = $(this).closest(".shared-card");
    const shareId = card.data("share-id");
    if (!shareId) return;

    currentShareIdToReport = shareId;
    $("#reportReason").val("");
    $("#reportModal").fadeIn();
});

$(".close-report-modal").click(function () {
    $("#reportModal").fadeOut();
});


//report window
$("#submitReport").click(function () {
    const reason = $("#reportReason").val().trim();
    if (!reason) {
        alert("נא למלא סיבת דיווח.");
        return;
    }

    db.collection("SharedArticles").doc(currentShareIdToReport).update({
        reported: true,
        reportReason: reason
    }).then(() => {
        alert("הדיווח נשלח, תודה!");
        $("#reportModal").fadeOut();
    }).catch(err => {
        console.error("שגיאה בשליחת הדיווח", err);
        alert("שגיאה בשליחת הדיווח.");
    });
});


//block button

$(document).on("click", ".block-user-btn", function () {
    const myUserId = localStorage.getItem("userId");
    const card = $(this).closest(".shared-card");
    const sharedUserId = card.data("shared-user-id");
    const sharedUserName = card.find(".shared-by").text().replace(" כתב:", "").trim();

    if (!myUserId || !sharedUserId) {
        alert("משהו השתבש בזיהוי המשתמש");
        return;
    }

    const confirmBlock = confirm(`האם אתה בטוח שברצונך לחסום את ${sharedUserName}?`);
    if (!confirmBlock) return;

    db.collection("Blocked")
        .doc(myUserId)
        .collection("Users")
        .doc(sharedUserId.toString())
        .set({
            username: sharedUserName,
            blockedAt: firebase.firestore.FieldValue.serverTimestamp()
        })

        .then(() => {
            alert(`${sharedUserName} added to block list`);
            // אין צורך להסיר את הפוסט מהמסך – ייעלם בטעינה הבאה
        })
        .catch(err => {
            console.error("Error blocking user:", err);
            alert("Error blocking user");
        });
});

//comment button
$(document).on("click", ".toggle-comments-btn", function () {
    const card = $(this).closest(".shared-card");
    const section = card.find(".comments-section");
    const list = section.find(".comment-list");
    const shareId = card.data("share-id");

    if (section.is(":visible")) {
        section.slideUp();
        $(this).text("💬 תגובות");
    } else {
        loadSharedComments(shareId, list);
        section.slideDown();
        $(this).text("⬆️ סגור תגובות");
    }
});

// add comment
$(document).on("click", ".add-shared-comment-btn", function () {
    const username = localStorage.getItem("username") || "אנונימי";
    const card = $(this).closest(".shared-card");
    const shareId = card.data("share-id");
    const input = card.find(".comment-input");
    const content = input.val().trim();

    if (!content || !shareId) return;

    db.collection("SharedArticles")
        .doc(shareId.toString())
        .collection("Comments")
        .add({
            content: content,
            username: username,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            input.val("");
            loadSharedComments(shareId, card.find(".comment-list"));
        })
        .catch(err => {
            console.error("שגיאה בהוספת תגובה לשיתוף", err);
        });
});

//load comment 
function loadSharedComments(shareId, container) {
    const currentUser = localStorage.getItem("username") || "";

    db.collection("SharedArticles")
        .doc(shareId.toString())
        .collection("Comments")
        .orderBy("createdAt", "desc")
        .get()
        .then(snapshot => {
            let html = "";
            snapshot.forEach(doc => {
                const data = doc.data();
                const name = data.username || "אנונימי";
                const isOwner = name === currentUser;

                html += `<li data-comment-id="${doc.id}" data-share-id="${shareId}">
                    <strong>${name}:</strong> ${data.content}`;

                if (isOwner) {
                    html += ` <button class="delete-comment-btn" title="מחק תגובה">🗑️</button>`;
                }

                html += `</li>`;
            });
            container.html(html);
        });
}

//delete comment by userid

$(document).on("click", ".delete-comment-btn", function () {
    const li = $(this).closest("li");
    const commentId = li.data("comment-id").toString();
    const shareId = li.data("share-id").toString();

    const confirmDelete = confirm("are you sure you want to delete?");
    if (!confirmDelete) return;

    db.collection("SharedArticles")
        .doc(shareId)
        .collection("Comments")
        .doc(commentId)
        .delete()
        .then(() => {
            loadSharedComments(shareId, li.closest(".comment-list"));
        })
        .catch(err => {
            console.error("שגיאה במחיקת תגובה", err);
            alert("שגיאה במחיקת תגובה");
        });
});

// share deleted
$(document).on("click", ".delete-share-btn", function () {
    const card = $(this).closest(".shared-card");
    const shareId = card.data("share-id");

    const confirmDelete = confirm("are you sure you want to delete?");
    if (!confirmDelete) return;

    db.collection("SharedArticles")
        .doc(shareId.toString())
        .delete()
        .then(() => {
            card.remove(); // הסרה מהמסך
            alert("share deleted succesfully.");
        })
        .catch(err => {
            console.error("Error deleted share", err);
            alert("Error deleted share.");
        });
});
