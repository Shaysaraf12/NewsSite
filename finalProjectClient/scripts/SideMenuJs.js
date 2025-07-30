// all sideMenu setting!

//add friend button

$(document).on("click", ".add-this-friend-btn", function () {
    const myUserId = localStorage.getItem("userId"); // המשתמש הנוכחי
    const friendId = $(this).data("friend-id");
    const friendName = $(this).data("friend-name");

    if (!myUserId || !friendId) {
        alert("Missing user info");
        return;
    }


    db.collection("Friends")
        .doc(myUserId)
        .collection("MyFriends")
        .doc(friendId.toString())
        .set({
            username: friendName,
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            alert("Friend added!");
            $("#addFriendModal").fadeOut();
        })
        .catch(err => {
            console.error("Error adding friend:", err);
            alert("Failed to add friend");
        });
});

$("#addFriendBtn").click(function () {
    $("#addFriendModal").fadeIn();
});

$(".close-add-friend-modal").click(function () {
    $("#addFriendModal").fadeOut();
});

// search friend by name
$("#searchFriendBtn").click(function () {  
    const input = $("#searchUsernameInput").val().trim();
    if (!input) return;

    $.ajax({
        url: "https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/User",
        method: "GET",
        success: function (users) {
            const inputLower = input.toLowerCase();
            const foundUser = users.find(u => u.username?.toLowerCase() === inputLower);
            const myUserId = localStorage.getItem("userId");

            if (!foundUser) {
                $("#searchFriendResult").html("<p>User not found ❌</p>");
                return;
            }

            if (foundUser.id.toString() === myUserId) {
                $("#searchFriendResult").html("<p>You can't add yourself 🤷‍♂️</p>");
                return;
            }

            const html = `
        <p>Found: ${foundUser.username}</p>
        <button class="add-this-friend-btn" data-friend-id="${foundUser.id}" data-friend-name="${foundUser.username}">
            Add as Friend
        </button>
         `;
            $("#searchFriendResult").html(html);
        },
        error: function () {
            alert("Failed to fetch users.");
        }

    });
});


// load friend list

$("#friendsListBtn").click(function () {
    const myUserId = localStorage.getItem("userId");
    if (!myUserId) {
        alert("Please login first.");
        return;
    }

    $("#myFriendsModal").fadeIn();
    const list = $("#friendsList");
    list.empty();

    db.collection("Friends")
        .doc(myUserId)
        .collection("MyFriends")
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                list.append("<li>You have no friends yet 😢</li>");
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const friendId = doc.id;
                const item = $(`
                          <li>
                            👤 ${data.username}
                            <button class="delete-friend-btn" data-friend-id="${friendId}">Delete</button>
                            <button class="block-friend-btn" data-friend-id="${friendId}" data-friend-name="${data.username}">Block</button>
                            <button class="chat-friend-btn" data-friend-id="${friendId}" data-friend-name="${data.username}">📩 Chat</button>

                          </li>
                        `);

                list.append(item);
            });

        })
        .catch(err => {
            console.error("Error loading friends:", err);
            alert("Failed to load friends");
        });
});

$(".close-my-friends-modal").click(function () {
    $("#myFriendsModal").fadeOut();
});



// remove friend
$(document).on("click", ".delete-friend-btn", function () {
    const myUserId = localStorage.getItem("userId");
    const friendId = $(this).data("friend-id");

    if (!myUserId || !friendId) return;

    db.collection("Friends")
        .doc(myUserId)
        .collection("MyFriends")
        .doc(friendId.toString())
        .delete()
        .then(() => {
            alert("Friend deleted");
            $(this).parent().remove(); 
        })
        .catch(err => {
            console.error("Error deleting friend:", err);
            alert("Failed to delete friend");
        });
});

// add to block list in fb

$(document).on("click", ".block-friend-btn", function () {
    const myUserId = localStorage.getItem("userId");
    const friendId = $(this).data("friend-id");
    const friendName = $(this).data("friend-name");

    if (!myUserId || !friendId || !friendName) return;

    // 1. add to block list
    db.collection("Blocked")
        .doc(myUserId)
        .collection("Users")
        .doc(friendId.toString())
        .set({
            username: friendName,
            blockedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            // 2. remove from friends
            return db.collection("Friends")
                .doc(myUserId)
                .collection("MyFriends")
                .doc(friendId.toString())
                .delete();
        })
        .then(() => {
            alert("User blocked and removed from friends");
            $(this).parent().remove();
        })
        .catch(err => {
            console.error("Error blocking user:", err);
            alert("Failed to block user");
        });
});



// Display blocked users

$("#blockedListBtn").click(function () {
    const myUserId = localStorage.getItem("userId");
    if (!myUserId) {
        alert("Please login first.");
        return;
    }

    $("#blockedUsersModal").fadeIn();
    const list = $("#blockedList");
    list.empty();

    db.collection("Blocked")
        .doc(myUserId)
        .collection("Users")
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                list.append("<li>No blocked users 🚫</li>");
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const blockedId = doc.id;

                const item = $(`
                  <li>
                    🚫 ${data.username}
                    <button class="unblock-user-btn" data-blocked-id="${blockedId}" data-blocked-name="${data.username}">
                            Unblock
                        </button>
                  </li>
                `);

                list.append(item);
            });
        })
        .catch(err => {
            console.error("Error loading blocked users:", err);
            alert("Failed to load blocked list");
        });
});

$(".close-blocked-users-modal").click(function () {
    $("#blockedUsersModal").fadeOut();
});


// Unblock button
$(document).on("click", ".unblock-user-btn", function () {
    const myUserId = localStorage.getItem("userId");
    const blockedId = $(this).data("blocked-id").toString();
    const blockedName = $(this).data("blocked-name");

    if (!myUserId || !blockedId || !blockedName) return;

    // 1. remove from blocklist
    db.collection("Blocked")
        .doc(myUserId)
        .collection("Users")
        .doc(blockedId)
        .delete()
        .then(() => {
            // 2. return to friend list
            return db.collection("Friends")
                .doc(myUserId)
                .collection("MyFriends")
                .doc(blockedId)
                .set({
                    username: blockedName,
                    addedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
        })
        .then(() => {
            alert("User unblocked and added as friend");
            $(this).parent().remove(); 
        })
        .catch(err => {
            console.error("Error unblocking user:", err);
            alert("Failed to unblock user");
        });
});


// display notifications
$("#notificationsBtn").click(function () {
    const myUserId = localStorage.getItem("userId");
    if (!myUserId) {
        alert("Please login first.");
        return;
    }

    $("#notificationsModal").fadeIn();
    const list = $("#notificationsList");
    list.empty();

    db.collection("Notifications")
        .doc(myUserId)
        .collection("List")
        .orderBy("createdAt", "desc")
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                list.append("<li>No notifications 🔕</li>");
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                const notificationId = doc.id;

                const item = $(`
                  <li>
                    🔔 ${data.message}
                    <button class="mark-read-btn" data-id="${notificationId}">❌</button>
                  </li>
                `);

                list.append(item);
            });

        })
        .catch(err => {
            console.error("Error loading notifications:", err);
            alert("Failed to load notifications");
        });
});

$(".close-notifications-modal").click(function () {
    $("#notificationsModal").fadeOut();
});


//Remove notification
$(document).on("click", ".mark-read-btn", function () {
    const myUserId = localStorage.getItem("userId");
    const notificationId = $(this).data("id");

    if (!myUserId || !notificationId) return;

    db.collection("Notifications")
        .doc(myUserId)
        .collection("List")
        .doc(notificationId)
        .delete()
        .then(() => {
            $(this).parent().remove(); // מסיר מהמסך
        })
        .catch(err => {
            console.error("Error deleting notification:", err);
            alert("Failed to mark as read");
        });
});
document.getElementById("toggleSidebarBtn").addEventListener("click", () => {
    document.getElementById("friendSidebar").classList.toggle("closed");
});


//adding chat with friends

// click on chat button
$(document).on("click", ".chat-friend-btn", async function () {
    const myUserId = localStorage.getItem("userId");
    const friendId = $(this).data("friend-id");
    const friendName = $(this).data("friend-name");

    if (!myUserId || !friendId) {
        alert("Missing user info");
        return;
    }

    try {
        
        const sortedIds = [myUserId, friendId].sort();
        const chatKey = sortedIds.join("_");

        const chatsRef = db.collection("chats");
        const querySnapshot = await chatsRef
            .where("chatKey", "==", chatKey)
            .get();

        let chatId;
        if (!querySnapshot.empty) {
            chatId = querySnapshot.docs[0].id;
        } else {
            const newChat = await chatsRef.add({
                members: sortedIds,
                chatKey: chatKey,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            chatId = newChat.id;
        }

        openChatModal(chatId, friendName, myUserId);
    } catch (err) {
        console.error("Error opening chat:", err);
        alert("Failed to open chat");
    }
});


// Global variables for active/open chat
let currentChatId = null;
let unsubscribeChat = null;


// Open chat modal and listen for messages
function openChatModal(chatId, friendName, myUserId) {
    currentChatId = chatId;

    $("#chatWithTitle").text("Chat with " + friendName);
    $("#chatModal").fadeIn();
    $("#chatMessages").empty();

    if (unsubscribeChat) unsubscribeChat();

    unsubscribeChat = db.collection("chats").doc(chatId)
        .collection("messages")
        .orderBy("timestamp")
        .onSnapshot(snapshot => {
            $("#chatMessages").empty();

            snapshot.forEach(doc => {
                const data = doc.data();
                const alignment = data.senderId === myUserId ? "right" : "left";
                const message = `
                  <div style="text-align: ${alignment}; margin: 5px 0;">
                    <strong>${data.senderName}:</strong> ${data.text}
                  </div>
                `;
                $("#chatMessages").append(message);
            });

            $("#chatMessages").scrollTop($("#chatMessages")[0].scrollHeight);
        });
}


// Send chat message
$("#sendChatBtn").click(function () {
    const myUserId = localStorage.getItem("userId");
    const myUsername = localStorage.getItem("username");
    const text = $("#chatInput").val().trim();

    if (!text || !currentChatId || !myUserId || !myUsername) return;

    db.collection("chats").doc(currentChatId)
        .collection("messages")
        .add({
            senderId: myUserId,
            senderName: myUsername,
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(async () => {
            $("#chatInput").val("");

            // הוספת התראה לחבר (לא לעצמך)
            const chatDoc = await db.collection("chats").doc(currentChatId).get();
            const members = chatDoc.data().members;
            const friendId = members.find(id => id !== myUserId);

            const messageText = text.length > 30 ? text.substring(0, 30) + "..." : text;

            await db.collection("Notifications")
                .doc(friendId)
                .collection("List")
                .add({
                    message: `${myUsername} sent you a message: "${messageText}"`,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
        })
        .catch(err => {
            console.error("Error sending message:", err);
            alert("Failed to send message");
        });
});



// close chat
$("#closeChatModal").click(function () {
    $("#chatModal").fadeOut();
    if (unsubscribeChat) unsubscribeChat();
});
