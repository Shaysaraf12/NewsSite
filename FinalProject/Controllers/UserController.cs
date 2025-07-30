using FinalProject;
using FinalProject.BL;
using FinalProject.DAL;
using Microsoft.AspNetCore.Mvc;


// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace FinalProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        // GET: api/<UserController>
        [HttpGet]
        public IActionResult GetAllUsers()
        {
            List<User> users = BL.User.GetAllUsers();
            return Ok(users);
        }


        // GET api/<UserController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

      
        // POST api/<UserController>
        [HttpPost]

        public IActionResult Register(User user)
        {
            try
            {
                BL.User.Register(user.Username, user.Email, user.Password);
                return Ok("User registered successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPost("login")]
        public IActionResult Login([FromBody] User user)
        {
            var foundUser = BL.User.Login(user.Email, user.Password);

            if (foundUser == null)
                return Unauthorized();

            foundUser.InsertLoginLog();

            return Ok(new
            {
                Id = foundUser.Id,
                Username = foundUser.Username,
                Email = foundUser.Email,
                IsAdmin = foundUser.IsAdmin,
                IsActive = foundUser.IsActive
            });
        }

        [HttpGet("logins/today")]
        public IActionResult GetTodayLogins()
        {
            int count = BL.User.GetTodayLoginCount();
            return Ok(count);
        }

        // PUT api/<UserController>/5
        [HttpPut("{id}/status")]
        public IActionResult UpdateStatus(int id, [FromBody] User u)
        {
            u.Id = id;
            u.UpdateStatus();
            return Ok();
        }


        // DELETE api/<UserController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
