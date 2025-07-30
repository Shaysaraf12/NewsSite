using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using Microsoft.AspNetCore.Mvc;

using System.Data;
using System.Net.Http;
using FinalProject;
using System.Text.Json;
using System.Collections.Generic;
using FinalProject.BL;


namespace FinalProject.DAL

{
    public class DBservices
    {

        public static string connectionString;

        static DBservices()
        {
            var config = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json")
                .Build();

            connectionString = config.GetConnectionString("myProjDB");
        }

        // Adds article parameters to the SQL command, handling nulls with DBNull.

        public static void AddArticleParameters(SqlCommand cmd, Article article)
        {
            cmd.Parameters.AddWithValue("@Title", article.Title ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Description", article.Description ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Url", article.Url ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@UrlToImage", article.UrlToImage ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@PublishedAt", article.PublishedAt);
            cmd.Parameters.AddWithValue("@SourceName", article.Source?.Name ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Content", article.Content ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("@Author", article.Author ?? (object)DBNull.Value);
        }

        // Executes the command and returns a single User from the database, or null if not found.
        public static User ReadSingleUser(SqlCommand cmd)
        {
            using (SqlConnection con = new SqlConnection(connectionString))
            {
                cmd.Connection = con;
                con.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    return new User
                    {
                        Id = (int)reader["Id"],
                        Username = reader["Username"].ToString(),
                        Email = reader["Email"].ToString(),
                        Password = reader["Password"].ToString(),
                        IsAdmin = (bool)reader["IsAdmin"],
                        IsActive = (bool)reader["IsActive"]
                    };
                }

                return null;
            }
        }


        // Reads and returns a list of articles from the database using the provided command.
        public static List<Article> ReadArticles(SqlCommand command)
        {
            List<Article> articles = new List<Article>();

            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                command.Connection = connection;
                connection.Open();
                SqlDataReader reader = command.ExecuteReader();

                while (reader.Read())
                {
                    Article article = new Article
                    {
                        Id = (int)reader["id"],
                        SourceId = (int)reader["sourceId"],
                        Author = reader["author"].ToString(),
                        Title = reader["title"].ToString(),
                        Description = reader["description"].ToString(),
                        Url = reader["url"].ToString(),
                        UrlToImage = reader["urlToImage"].ToString(),
                        PublishedAt = DateTime.Parse(reader["publishedAt"].ToString()),
                        Content = reader["content"].ToString(),
                        Source = new Source
                        {
                            Id = (int)reader["sourceId"],
                            Name = reader["sourceName"].ToString()
                        }
                    };

                    articles.Add(article);
                }
            }

            return articles;
        }
        // Reads and returns a list of all users from the database.
        public static List<User> ReadUsers(SqlCommand cmd)
        {
            List<User> users = new List<User>();

            using (SqlConnection con = new SqlConnection(connectionString))
            {
                cmd.Connection = con;
                con.Open();

                SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    User u = new User
                    {
                        Id = (int)reader["Id"],
                        Username = reader["Username"].ToString(),
                        Email = reader["Email"].ToString(),
                        Password = reader["Password"].ToString(),
                        IsAdmin = (bool)reader["IsAdmin"],
                        IsActive = (bool)reader["IsActive"]
                    };

                    users.Add(u);
                }
            }

            return users;
        }
        // Retrieves all users from the NewsUser table.
        public static List<User> GetAllUsers()
        {
            SqlCommand cmd = new SqlCommand("SELECT * FROM NewsUser");
            return ReadUsers(cmd);
        }

        // Retrieves all articles 
        public static List<Article> GetAllArticles()
        {
            SqlCommand cmd = new SqlCommand("GetAllArticles");
            cmd.CommandType = CommandType.StoredProcedure;

            return DBservices.ReadArticles(cmd);
        }

        // Inserts a new article into the database using a stored procedure.
        public static void InsertArticleToDB(Article article)
        {
            using (SqlConnection con = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("InsertArticleSP", con);
                cmd.CommandType = CommandType.StoredProcedure;

                AddArticleParameters(cmd, article);

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }



        // Inserts a new user into the database 
        public static void InsertNewsUser(string username, string email, string password)
        {
            using (SqlConnection con = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("InsertNewsUser", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Username", username);
                cmd.Parameters.AddWithValue("@Email", email);
                cmd.Parameters.AddWithValue("@Password", password);

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }
        // Authenticates a user by identifier and password
        public static User Login(string identifier, string password)
        {
            SqlCommand cmd = new SqlCommand("LoginNewsUser");
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@Identifier", identifier); // 
            cmd.Parameters.AddWithValue("@Password", password);

            User u = ReadSingleUser(cmd);

            if (u != null && u.Username.ToLower() == "admin")
                u.IsAdmin = true;

            return u;
        }


        // Saves an article for a specific user and returns true if successful.
        public static bool SaveArticles(int userId, int articleId)
        {
            using (SqlConnection con = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("SaveArticleForUser", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@UserId", userId);
                cmd.Parameters.AddWithValue("@ArticleId", articleId);

                con.Open();
                int result = cmd.ExecuteNonQuery();
                return result > 0;
            }
        }
        // Returns all articles saved by the specified user.
        public static List<Article> GetSavedArticles(int userId)
        {
            SqlCommand cmd = new SqlCommand("GetSavedArticlesByUserId");
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserId", userId);

            return ReadArticles(cmd);
        }

        // Searches and returns articles that match the given query.
        public static List<Article> SearchArticles(string query)
        {
            SqlCommand cmd = new SqlCommand("SearchArticlesByQuery");
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@Query", query);

            return ReadArticles(cmd);
        }

        // Returns articles published within the specified date range.
        public static List<Article> GetArticlesByDateRange(DateTime fromDate, DateTime toDate)
        {
            SqlCommand cmd = new SqlCommand("SearchArticlesByDateRange");
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@FromDate", fromDate);
            cmd.Parameters.AddWithValue("@ToDate", toDate);

            return ReadArticles(cmd);
        }

        // Marks an article as deleted by setting the DeletedAt field.
        public static int SoftDeleteArticle(int id)
        {
            using (SqlConnection con = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("UPDATE Article SET DeletedAt = GETDATE() WHERE Id = @Id", con);
                cmd.Parameters.AddWithValue("@Id", id);
                con.Open();
                return cmd.ExecuteNonQuery();
            }
        }

        // Soft deletes a saved article for a specific user.
        public static void SoftDeleteSavedArticle(int userId, int articleId)
        {
            using (SqlConnection con = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("SoftDeleteSavedArticle", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@UserId", userId);
                cmd.Parameters.AddWithValue("@ArticleId", articleId);

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }

        // Registers a user's rating (vote) for an article.
        public static void VoteArticle(int articleId, int userId, int rating)
        {
            using (SqlConnection con = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("VoteArticle", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ArticleID", articleId);
                cmd.Parameters.AddWithValue("@UserID", userId);
                cmd.Parameters.AddWithValue("@Rating", rating);

                con.Open();
                cmd.ExecuteNonQuery();
                con.Close();
            }
        }

        // Retrieves the number of likes and dislikes for a specific article.
        public static (int likes, int dislikes) GetRatingStats(int articleId)
        {
            int likes = 0;
            int dislikes = 0;

            using (SqlConnection con = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("GetRatingStats", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@ArticleID", articleId);

                con.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    likes = reader["Likes"] != DBNull.Value ? Convert.ToInt32(reader["Likes"]) : 0;
                    dislikes = reader["Dislikes"] != DBNull.Value ? Convert.ToInt32(reader["Dislikes"]) : 0;
                }

                reader.Close();
            }

            return (likes, dislikes);
        }
        // Updates the IsActive flag of the specified user
        public static int UpdateUserStatus(int id, bool isActive)
        {
            SqlCommand cmd = new SqlCommand("UPDATE NewsUser SET IsActive = @IsActive WHERE Id = @Id");
            cmd.Parameters.AddWithValue("@IsActive", isActive);
            cmd.Parameters.AddWithValue("@Id", id);

            using (SqlConnection con = new SqlConnection(connectionString))
            {
                cmd.Connection = con;
                con.Open();
                return cmd.ExecuteNonQuery();
            }
        }

        // Inserts a login log entry 
        public static void InsertLoginLog(int userId)
        {
            SqlCommand cmd = new SqlCommand("InsertLoginLog");
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@UserId", userId);

            using (SqlConnection con = new SqlConnection(connectionString))
            {
                cmd.Connection = con;
                con.Open();
                cmd.ExecuteNonQuery();
            }
        }


        // Returns the number of user logins that occurred today.
        public static int GetTodayLoginCount()
        {
            SqlCommand cmd = new SqlCommand("GetTodayLoginCount");
            cmd.CommandType = CommandType.StoredProcedure;

            using (SqlConnection con = new SqlConnection(connectionString))
            {
                cmd.Connection = con;
                con.Open();
                return (int)cmd.ExecuteScalar();
            }
        }

        // Logs the time when news articles were pulled into the system.
        public static void InsertNewsPullLog()
        {
            using (SqlConnection con = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("InsertNewsPullLog", con);
                cmd.CommandType = CommandType.StoredProcedure;
                con.Open();
                cmd.ExecuteNonQuery();
            }
        }

        // Returns the total number of news pull operations logged.
        public static int GetNewsPullCount()
        {
            using (SqlConnection con = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("SELECT COUNT(*) FROM NewsPullLog", con);
                con.Open();
                return (int)cmd.ExecuteScalar();
            }
        }

        // Returns the number of articles saved today (excluding soft-deleted ones).
        public static int GetTodaySavedArticlesCount()
        {
            using (SqlConnection con = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand(
                    "SELECT COUNT(*) FROM SavedArticles WHERE CAST(SavedAt AS DATE) = CAST(GETDATE() AS DATE) AND DeletedAt IS NULL", con);
                con.Open();
                return (int)cmd.ExecuteScalar();
            }
        }

        // Returns a list of today's saved articles grouped by title with their save count.
        public static List<(string Title, int Count)> GetTodaySavedArticlesGrouped()
        {
            List<(string, int)> results = new List<(string, int)>();

            using (SqlConnection con = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("GetTodaySavedArticlesGrouped", con);
                cmd.CommandType = CommandType.StoredProcedure;

                con.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    string title = reader["Title"].ToString();
                    int count = Convert.ToInt32(reader["SaveCount"]);
                    results.Add((title, count));
                }
            }

            return results;
        }

        // Retrieves a single article by its ID
        public static Article GetArticleById(int id)
        {
            SqlCommand command = new SqlCommand("SELECT A.*, S.Name AS sourceName FROM Article A JOIN Source S ON A.SourceId = S.Id WHERE A.Id = @Id");
            command.Parameters.AddWithValue("@Id", id);

            List<Article> articles = ReadArticles(command);
            return articles.FirstOrDefault(); // אם אין – מחזיר null
        }

        // Returns a list of all soft-deleted articles.

        public static List<Article> GetDeletedArticles()
        {
            SqlCommand command = new SqlCommand(@"
        SELECT A.*, S.Name AS sourceName 
        FROM Article A 
        JOIN Source S ON A.SourceId = S.Id 
        WHERE A.DeletedAt IS NOT NULL
             ");
            return ReadArticles(command);
        }

        // Restores a soft-deleted article by clearing its DeletedAt field.

        public static void RestoreArticle(int id)
        {
            using (SqlConnection con = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("UPDATE Article SET DeletedAt = NULL WHERE Id = @Id", con);
                cmd.Parameters.AddWithValue("@Id", id);

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }



    }

}

