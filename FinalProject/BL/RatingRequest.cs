using FinalProject.DAL;

namespace FinalProject.BL
{
    public class RatingRequest
    {
        public int ArticleID { get; set; }
        public int UserID { get; set; }
        public int Rating { get; set; } // 1 = LIKE, -1 = DISLIKE

        public void SaveVote()
        {
            DBservices.VoteArticle(ArticleID, UserID, Rating);
        }

        public static (int likes, int dislikes) GetStats(int articleId)
        {
            return DBservices.GetRatingStats(articleId);
        }

    }
}
