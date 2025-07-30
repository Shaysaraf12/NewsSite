using FinalProject;
using FinalProject.DAL;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text;

namespace FinalProject.BL
{

    public class Article
    {
        public int Id { get; set; }

        public int SourceId{ get; set; }         // Foreign Key
        public Source Source { get; set; }        

        public string Author { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Url { get; set; }
        public string UrlToImage { get; set; }
        public DateTime ?PublishedAt { get; set; }
        public string Content { get; set; }
        public DateTime? DeletedAt { get; set; }

        public Article() { }

        public Article(int sourceId, string author, string title, string description, string url, string urlToImage, DateTime publishedAt, string content)
        {
            SourceId = sourceId;
            Author = author;
            Title = title;
            Description = description;
            Url = url;
            UrlToImage = urlToImage;
            PublishedAt = publishedAt;
            Content = content;
        }

        public static void InsertArticle(Article article)
        {
            DBservices.InsertArticleToDB(article);
        }

        public static void SaveAllToDB(List<Article> articles)
        {
            foreach (Article article in articles)
            {
                DBservices.InsertArticleToDB(article);
            }
        }
        public static List<Article> GetArticles()
        {
          return DBservices.GetAllArticles();
        }
        public static List<Article> SearchArticles(string query)
        {
            return DBservices.SearchArticles(query);
        }
        public static List<Article> GetArticlesByDateRange(DateTime from, DateTime to)
        {
            return DBservices.GetArticlesByDateRange(from, to);
        }

        public int SoftDelete()
        {
            return DBservices.SoftDeleteArticle(this.Id);
        }
        public static Article GetById(int id)
        {
            return DBservices.GetArticleById(id);
        }
        public static List<Article> GetDeletedArticles()
        {
            return DBservices.GetDeletedArticles();
        }
        public static void Restore(int id)
        {
            DBservices.RestoreArticle(id);
        }






        //Method for using ChatGpt Api

        public async Task<string> SummarizeAsync()
        {
            if (string.IsNullOrWhiteSpace(this.Content))
                return "❌ Nothing to Summerise.";

            string apiKey = "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"; 

            if (string.IsNullOrWhiteSpace(apiKey))
                return "🔒 No Api Key.";

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var requestBody = new
            {
                model = "gpt-3.5-turbo",
                messages = new[]
                {
            new { role = "system", content = "Summarize the following article in one paragraph in clear English. Also provide a general opinion: does the article express a positive, negative, or neutral stance?" },
            new { role = "user", content = this.Content }
             }
            };

            var contentJson = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await httpClient.PostAsync("https://api.openai.com/v1/chat/completions", contentJson);

            if (!response.IsSuccessStatusCode)
                return "❌ שגיאה בתקשורת עם OpenAI.";

            using var json = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
            string? result = json.RootElement
                 .GetProperty("choices")[0]
                 .GetProperty("message")
                 .GetProperty("content")
                 .GetString();

            return result ?? "❌ לא התקבל סיכום מהשרת.";

        }



    }
}

