
const firebaseConfig = {
    apiKey: "AIzaSyCsmYHyueyIUBkeUmvdlUNA6Q8j6AtqJiI",
    authDomain: "articlecomments-7757d.firebaseapp.com",        
    projectId: "articlecomments-7757d",
    storageBucket: "articlecomments-7757d.firebasestorage.app",
    messagingSenderId: "1098448651369",
    appId: "1:1098448651369:web:cfa8de0ca2da679dd30ef8",
    measurementId: "G-VPTEC1LKLM"
};

// initialization Firebase
firebase.initializeApp(firebaseConfig);

//  Firestore connection
const db = firebase.firestore();


// add comment
$(document).on("click", ".add-comment-btn", function () {
    const username = localStorage.getItem("username");
    const articleDiv = $(this).closest(".article-card");
    const articleId = articleDiv.data("article-id").toString();
    const input = articleDiv.find(".comment-input");
    const content = input.val().trim();

    if (!content) return;

    db.collection("Articles").doc(articleId).collection("Comments").add({
        content: content,
        username: username,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        likes: 0,
        dislikes: 0
    }).then(() => {
        alert("comment added!");
        input.val("");
        loadComments(articleId, articleDiv.find(".comment-list"));

        // add notifications
        const myUserId = localStorage.getItem("userId");
        const articleTitle = articleDiv.find("h2").text();

        db.collection("Friends")
            .doc(myUserId)
            .collection("MyFriends")
            .get()
            .then(snapshot => {
                snapshot.forEach(friendDoc => {
                    const friendId = friendDoc.id;
                    const message = `${username} הגיב על הפוסט: ${articleTitle}`;

                    db.collection("Notifications")
                        .doc(friendId.toString())

                        .collection("List")
                        .add({
                            message: message,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                });
            });
    }).catch((err) => {
        console.error("error adding comment", err);
    });
});
     
//display comment
function loadComments(articleId, container) {
    try {
        const currentUser = localStorage.getItem("username") || "";

        db.collection("Articles").doc(articleId.toString()).collection("Comments")
            .orderBy("createdAt", "desc")
            .get().then(snapshot => {
                let html = "";
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const name = data.username || "אנונימי";
                    const likes = data.likes || 0;
                    const dislikes = data.dislikes || 0;
                    const isOwner = name === currentUser;

                    html += `
                        <li data-comment-id="${doc.id}" data-article-id="${articleId}">
                            <strong>${name}:</strong> ${data.content}<br/>
                            <button class="like-comment-btn">👍 Like</button>
                            <span class="comment-likes-count">${likes}</span>
                            <button class="dislike-comment-btn">👎 Dislike</button>
                            <span class="comment-dislikes-count">${dislikes}</span>`;

                    if (isOwner) {
                        html += ` <button class="delete-comment-btn" title="מחק תגובה">🗑️</button>`;
                    }

                    html += `</li>`;
                });
                container.html(html);
            });
    } catch (err) {
        console.error("שגיאה בטעינת תגובות לכתבה:", articleId, err);
    }
}

// delete comment

$(document).on("click", ".delete-comment-btn", function () {
    const li = $(this).closest("li");
    const commentId = li.data("comment-id").toString();
    const articleId = li.data("article-id").toString();

    const confirmDelete = confirm("האם אתה בטוח שברצונך למחוק את התגובה?");
    if (!confirmDelete) return;

    db.collection("Articles")
        .doc(articleId)
        .collection("Comments")
        .doc(commentId)
        .delete()
        .then(() => {
            loadComments(articleId, li.closest(".comment-list"));
        })
        .catch(err => {
            console.error("שגיאה במחיקת תגובה", err);
            alert("שגיאה במחיקת תגובה");
        });
});


//like comment button
function likeComment(articleId, commentId) {                        
    const commentRef = db
        .collection("Articles")
        .doc(articleId.toString())
        .collection("Comments")
        .doc(commentId.toString());

    return commentRef.update({
        likes: firebase.firestore.FieldValue.increment(1)
    });
}

//dislike comment button

function dislikeComment(articleId, commentId) {                  
    const commentRef = db
        .collection("Articles")
        .doc(articleId.toString())
        .collection("Comments")
        .doc(commentId.toString());

    return commentRef.update({
        dislikes: firebase.firestore.FieldValue.increment(1)
    });
}

//click like button
$(document).on("click", ".like-comment-btn", function () {             
    const li = $(this).closest("li");
    const commentId = li.data("comment-id").toString();
    const articleId = li.data("article-id").toString();

    likeComment(articleId, commentId).then(() => {
        const span = li.find(".comment-likes-count");
        span.text(parseInt(span.text()) + 1);
    });
});


//click dislike button
$(document).on("click", ".dislike-comment-btn", function () {             
    const li = $(this).closest("li");
    const commentId = li.data("comment-id").toString();
    const articleId = li.data("article-id").toString();

    dislikeComment(articleId, commentId).then(() => {
        const span = li.find(".comment-dislikes-count");
        span.text(parseInt(span.text()) + 1);
    });
});




//show/hide comments
$(document).on("click", ".toggle-comments-btn", function () {           
    const articleCard = $(this).closest(".article-card");
    const section = articleCard.find(".comments-section");
    const list = section.find(".comment-list");
    const articleId = articleCard.data("article-id");

    if (section.is(":visible")) {
        section.slideUp();
        $(this).text("💬 תגובות");
    } else {
        loadComments(articleId, list);
        section.slideDown();
        $(this).text("⬆️ סגור תגובות");
    }
});


// share article and insert to db
function shareArticleToFirebase(articleObj, comment, username) {
    if (!articleObj || !username) {
        console.error("Missing article or username");
        return;
    }

    const userId = localStorage.getItem("userId");

    // insert to db
    db.collection("SharedArticles").add({
        articleId: articleObj.id,
        title: articleObj.title,
        description: articleObj.description,
        url: articleObj.url,
        image: articleObj.image,
        sharedBy: username,
        userId: userId,
        comment: comment,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
        .then(() => {
            // add Notifications by friendid
            return db.collection("Friends")
                .doc(userId)
                .collection("MyFriends")
                .get();
        })
        .then(snapshot => {
            const batch = db.batch();

            snapshot.forEach(doc => {
                const friendId = doc.id;

                const notifRef = db.collection("Notifications")
                    .doc(friendId)
                    .collection("List")
                    .doc();

                batch.set(notifRef, {
                    message: `${username} shared a new article: "${articleObj.title}"`,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    type: "share"
                });
            });

            return batch.commit();
        })
        .then(() => {
            alert("the article has been shared succesfuly!");
            $("#shareModal").fadeOut();
        })
        .catch((err) => {
            console.error("error in sharing", err);
            alert("error sharing");
        });
}




