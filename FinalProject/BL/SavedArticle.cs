using FinalProject.DAL;
using System.Reflection.Metadata.Ecma335;
using System.Text.Json.Serialization;


namespace FinalProject.BL
{
    public class SavedArticle
    {
        public SavedArticle() { } 

        public int UserId { get; set; }
        public int ArticleId { get; set; }

        public DateTime SavedAt { get; set; } = DateTime.Now;
        public DateTime? DeletedAt { get; set; }

        [JsonIgnore]
        public User? User { get; set; }

        [JsonIgnore]
        public Article ?Article { get; set; }

        public bool SaveArticle()
        {
            return DBservices.SaveArticles(this.UserId, this.ArticleId);
        }

        public static List<Article> GetSavedArticles(int userId)
        {
            return DBservices.GetSavedArticles(userId);
        }
        public static void SoftDelete(int userId, int articleId)
        {
            DBservices.SoftDeleteSavedArticle(userId, articleId);
        }
        public  int GetTotalSavedToday()
        {
            return DBservices.GetTodaySavedArticlesCount();
        }
        public  List<(string Title, int Count)> GetSavedArticlesGroupedToday()
        {
            return DBservices.GetTodaySavedArticlesGrouped();
        }

    }


}
