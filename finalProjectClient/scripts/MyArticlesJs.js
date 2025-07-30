
//articles render
$(document).ready(function () {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("You must be logged in to view saved articles.");
        window.location.href = "login.html"; // מעבר לעמוד ההתחברות

        return;
    }

    $.ajax({
        url: `https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/SavedArticles/user/${userId}`,
        method: "GET",
        success: function (articles) {
            displayArticles(articles); // פונקציה קיימת שמציגה את הכתבות
        },
        error: function (xhr, status, error) {
            console.error("Failed to load saved articles:", error);
        }
    });
});
function displayArticles(articles) {
    const container = $("#articles-container");
    container.empty();

    articles.forEach(article => {
        const card = $(`
            <div class="article-card">
                <img src="${article.urlToImage}" alt="Image">
                <div class="content">
                    <h2>${article.title}</h2>
                    <p class="source"><strong>Source:</strong> ${article.source.name}</p>
                    <p>${article.description || ""}</p>
                    <a href="${article.url}" target="_blank">לכתבה המלאה</a>
                    <button class="delete-article-btn" data-article-id="${article.id}">Delete</button>

                </div>
            </div>
        `);

        container.append(card);
    });
}
//delete article
$(document).on("click", ".delete-article-btn", function () {
    const articleId = $(this).data("article-id");
    const userId = localStorage.getItem("userId");
    const card = $(this).closest(".article-card"); // ← שמירה על אלמנט הכרטיס

    if (!userId) {
        alert("Please login first.");
        return;
    }

    $.ajax({
        url: `https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/SavedArticles/delete/${userId}/${articleId}`,
        method: "DELETE",
        success: function () {
            alert("Article deleted.");
            card.remove(); // ← מוחק רק את הכרטיס הזה מהמסך
        },
        error: function () {
            alert("Failed to delete article.");
        }
    });
});

//Search By Title

let allMyArticles = [];

const userId = localStorage.getItem("userId");

$.ajax({
    url: `https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/SavedArticles/user/${userId}`,
    method: "GET",
    success: function (articles) {
        allMyArticles = articles;
        displayArticles(articles); 
    },
    error: function () {
        alert("שגיאה בטעינת הכתבות שלך");
    }
});

$("#searchMyTitleBtn").click(function () {
    const query = $("#searchMyTitle").val().toLowerCase();
    if (!query) return;

    const filtered = allMyArticles.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.source.name.toLowerCase().includes(query)
    );

    displayArticles(filtered);
});
