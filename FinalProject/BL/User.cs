using FinalProject.DAL;
using System.Data.SqlClient;

namespace FinalProject.BL
{
    public class User
    {
        public int Id { get; set; }

        public string? Username { get; set; }   // Optional if email is main
        public string Email { get; set; }      // Can be used for login
        public string Password { get; set; }   // (Should be hashed in production)

        public bool IsAdmin { get; set; }      // True if user is an admin
        public bool IsActive { get; set; }     // False if blocked

        public User() { }

        public User(string username, string email, string password, bool isAdmin = false, bool isActive = true)
        {
            Username = username;
            Email = email;
            Password = password;
            IsAdmin = isAdmin;
            IsActive = isActive;
        }

        public static List<User> GetAllUsers()
        {
            return DBservices.GetAllUsers();
        }

        public static void Register(string username, string email, string password)
        {
            DBservices.InsertNewsUser(username, email, password);
        }
        public static User Login(string identifier, string password)
        {
            return DBservices.Login(identifier, password);
        }

        public int UpdateStatus()
        {
            return DBservices.UpdateUserStatus(this.Id, this.IsActive);
        }
        public void InsertLoginLog()
        {
            DBservices.InsertLoginLog(this.Id);
        }
        public static int GetTodayLoginCount()
        {
            return DBservices.GetTodayLoginCount();
        }
    }

}
