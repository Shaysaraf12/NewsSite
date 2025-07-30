//Articles Render
$(document).ready(function () {                       
   
    $.ajax({
        url: "https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/Article",
        method: "GET",
        success: function (articles) {
            displayArticles(articles);
        },
        error: function (xhr, status, error) {
            console.error("שגיאה בקבלת כתבות:", error);
        }
    });
    //Only Admin can see
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!isAdmin) {
        $(".admin-only").hide();
    }


    const username = localStorage.getItem("username") || "Guest";
    document.getElementById("greeting").textContent = `Hello, ${username}`;


    // login Button
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.clear();
         alert("logout succesfuly");
        window.location.href = "login.html";
    });
    
     //  Slider last news
    $.ajax({
        url: "https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/Article",
        method: "GET",
        success: function (articles) {
            const shuffled = articles.sort(() => 0.5 - Math.random());
            const randomFive = shuffled.slice(0, 5);
            displayRecentArticles(randomFive);
        },
        error: function () {
            alert(" Error fetching article");

        }
    });


       
   
    // show last slides
    function displayRecentArticles(articles) {
        const container = $("#latest-slider");
        container.empty();

        articles.forEach(article => {
            const card = $(`
            <div class="article-simple-card">
                <img src="${article.urlToImage}" alt="Image">
                <div class="simple-content">
                    <p>${article.title}</p2>
                    <p class="source"><strong>Source:</strong> ${article.source.name}</p>
                    <p class="date"><strong>Date:</strong> ${new Date(article.publishedAt).toLocaleDateString()}</p>
                    <p class="description">${article.description || ""}</p>
                    <a href="${article.url}" target="_blank">קרא את הכתבה המלאה</a>
                </div>
            </div>
        `);

            container.append(card);
        });
    }




    // Search by Text or source
    $("#searchTextBtn").click(function () {                   
        const query = $("#textQuery").val();
        if (!query) return;

        $.ajax({
            url: `https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/Article/search?query=${query}`,
            method: "GET",
            success: displayArticles,
            error: function () {
                alert("Search by text failed");
            }
        });
    });


    // Search By Date
    $("#searchDateBtn").click(function () {                               
        const from = $("#fromDate").val();
        const to = $("#toDate").val();
        if (!from || !to) {
            alert("Please select both dates.");
            return;
        }

        $.ajax({
            url: `https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/Article/byDate/${from}/${to}`,
            method: "GET",
            success: displayArticles,
            error: function () {
                alert("Search by date failed");
            }
        });
    });

    //Search By voice

    const voiceBtn = document.getElementById("voiceSearchBtn");

    voiceBtn.addEventListener("click", () => {
        voiceBtn.classList.add("listening");

        // סימולציה של הקלטה 4 שניות:
        setTimeout(() => {
            voiceBtn.classList.remove("listening");
        }, 4000);
    });



    //  Category division

    $(".category").on("click", function () {                               
        const selectedCategory = $(this).data("tag");
        if (selectedCategory === "All") {
            $(".article-card").show();
            return;
        }

        const keywords = keywordMap[selectedCategory] || [];
        const sources = sourceHints[selectedCategory] || [];

        $(".article-card").each(function () {
            const title = $(this).find("h2").text().toLowerCase(); // מילות מפתח שקשורות לכותרת
            const desc = $(this).find("p").not(".source").text().toLowerCase(); 
            const source = $(this).find(".source").text().toLowerCase(); // מילות מפתח שקשורות למקור

            const keywordMatch = keywords.some(word =>
                title.includes(word) || desc.includes(word)
            );

            const sourceMatch = sources.some(hint =>
                source.includes(hint)
            );

            if (keywordMatch || sourceMatch) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
});
//Keyword for catagories

const keywordMap = {
    Apple: ["apple", "iphone", "mac", "ios", "ipad", "tim cook"],
    Tesla: ["tesla", "elon musk", "model 3", "model y", "cybertruck", "gigafactory"],
    Google: ["google", "android", "pixel", "search engine", "chrome", "sundar pichai"],
    Meta: ["facebook", "meta", "instagram", "whatsapp", "mark zuckerberg", "threads"],
    WallStreet: ["wall street", "stock", "market", "nasdaq", "dow jones", "sp500", "finance", "investment"],
    AI: ["ai", "artificial intelligence", "gpt", "chatgpt", "openai", "machine learning", "deep learning"]
};


//keyword for source
const sourceHints = {
    Apple: ["macrumors", "9to5mac", "appleinsider"],
    Tesla: ["electrek", "teslarati", "insideevs"],
    Google: ["the verge", "android central", "cnet"],
    Meta: ["techcrunch", "wired", "business insider"],
    WallStreet: ["bloomberg", "forbes", "cnbc", "marketwatch"],
    AI: ["openai", "venturebeat", "semianalysis", "techcrunch"]
};



// display articles
function displayArticles(articles) {          
    const container = $("#articles-container");
    container.empty();

    articles.forEach(article => {
        const isAdmin = localStorage.getItem("isAdmin") === "true";
        let deleteButton = "";
        if (isAdmin) {
            deleteButton = `<button class="delete-article-btn" data-article-id="${article.id}">🗑️ Delete Article</button>`;
        }

        const card = $(`
            <div class="article-card" data-article-id="${article.id.toString()}">
                <img src="${article.urlToImage}" alt="Image">
                <div class="content">
                    <h2>${article.title}</h2>
                    <p class="source"><strong>Source:</strong> ${article.source.name}</p>
                    <p>${article.description || ""}</p>
                        <p class="date"><strong>Published at:</strong> ${new Date(article.publishedAt).toLocaleDateString('he-IL')}</p>

                    <a href="${article.url}" target="_blank">לכתבה המלאה</a><br/>
                       <div class="article-actions-bar">
                              <button class="save-article-btn" data-article-id="${article.id}">💾 שמור</button>

                              <div>
                                <button class="like-btn vote-btn" data-article-id="${article.id}">👍 Like</button>
                                <span class="likes-count vote-count" id="likes-count-${article.id}">0</span>
                              </div>

                              <div>
                                <button class="dislike-btn vote-btn" data-article-id="${article.id}">👎 Dislike</button>
                                <span class="dislikes-count vote-count" id="dislikes-count-${article.id}">0</span>
                              </div>

                               <button class="share-btn">Share</button>
                              <button class="toggle-comments-btn">💬 תגובות</button>
                              <button class="summarize-btn" data-article-id="${article.id}">🧠 סכם לי</button>
                              ${deleteButton};

                            </div>
                        <div class="comments-section" style="display: none;">
                          <ul class="comment-list"></ul>
                          <input type="text" class="comment-input" placeholder="כתוב תגובה..." />
                          <button class="add-comment-btn">שלח תגובה</button>
                        </div>
                </div>
            </div>
        `);

        container.append(card);
        loadStats(article.id);
    });
}

//


// Handle article share button click
 let currentArticleToShare = null;
$(document).on("click", ".share-btn", function () {      
    const articleCard = $(this).closest(".article-card");

    currentArticleToShare = {
        id: articleCard.data("article-id"),
        title: articleCard.find("h2").text(),
        description: articleCard.find("p").not(".source, .date").text(),
        url: articleCard.find("a").attr("href"),
        image: articleCard.find("img").attr("src")
    };

    $("#shareModal").fadeIn();
});

// Confirm and share article
$("#confirmShare").click(function () {
    const comment = $("#shareComment").val().trim();
    const username = localStorage.getItem("username") || "אנונימי";

    if (!currentArticleToShare) return;

    shareArticleToFirebase(currentArticleToShare, comment, username);
});


$(".close-modal").click(function () {
    $("#shareModal").fadeOut();
});


//add like or dislike
function vote(articleId, rating) {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please login first.");
        return;
    }

    $.ajax({
        url: "https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/ratings/vote",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ articleID: articleId, userID: userId, rating: rating }),
        success: function () {
            loadStats(articleId);
        },
        error: function () {
            alert("Voting failed");
        }
    });
}

// Returns the number of like//dislike
function loadStats(articleId) {
    $.get(`https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/ratings/stats/${articleId}`, function (data) {
        $(`#likes-count-${articleId}`).text(data.likes);
        $(`#dislikes-count-${articleId}`).text(data.dislikes);
    });
}
//like button
$(document).on("click", ".like-btn", function () {                  
    const articleId = $(this).data("article-id");
    vote(articleId, 1);

});
//dislike button
$(document).on("click", ".dislike-btn", function () {              
    const articleId = $(this).data("article-id");
    vote(articleId, -1);
});

//add to saved
$(document).on("click", ".save-article-btn", function () {          
    const articleId = $(this).data("article-id");
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please login first.");
        return;
    }

    $.ajax({ 
        url: "https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/SavedArticles/save",              
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ userId, articleId }),
        success: function (res) {
            alert(res); 
        },
        error: function (xhr) {
            alert("error saved article: " + xhr.responseText);
        }


    });
});

//delete button only for admibn
$(document).on("click", ".delete-article-btn", function () {       
    const button = $(this);
    const id = button.data("article-id");

    $.ajax({
        url: `https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/Article/${id}`,
        method: "DELETE",
        success: function () {
            alert("Article Deleted");
            button.closest(".article-card").remove();
        },
        error: function () {
            alert("error deleting");
        }
    });
});



//summery by chat
$(document).on('click', '.summarize-btn', async function () {
    const articleId = $(this).data('article-id');
    try {
        const res = await fetch(`https://proj.ruppin.ac.il/cgroup23/test2/tar1/api/Article/summarize/${articleId}`);

        const data = await res.json();
        $('#summary-text').text(data.summary);
        $('#summary-modal').fadeIn();
    } catch (err) {
        $('#summary-text').text("שגיאה בעת הסיכום");
        $('#summary-modal').fadeIn();
    }
});
$(document).on('click', '.close-modal', function () {
    $('#summary-modal').fadeOut();
});


//using chat for voice search

async function handleVoiceSearch() {
    const voiceBtn = document.getElementById("voiceSearchBtn");
    const textInput = document.getElementById("textQuery");
    const searchBtn = document.getElementById("searchTextBtn");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

        mediaRecorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const file = new File([blob], "voice.webm");

            const formData = new FormData();
            formData.append("file", file);
            formData.append("model", "whisper-1");

            const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
                method: "POST",
                headers: {
                    "Authorization": ""
                },
                body: formData
            });

            const data = await response.json();
            const transcript = data.text;

            textInput.value = transcript;
            searchBtn.click();
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 4000); // 4 שניות הקלטה

    } catch (err) {
        console.error("Voice search error:", err);
        alert("בעיה בגישה למיקרופון או ב־API.");
    }
}

//voice button

document.getElementById("voiceSearchBtn").addEventListener("click", handleVoiceSearch);

