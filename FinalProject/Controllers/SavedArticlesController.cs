using FinalProject.BL;
using FinalProject.DAL;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace FinalProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SavedArticlesController : ControllerBase
    {
        // GET: api/<SavedArticlesController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }
       
       


        // GET api/<SavedArticlesController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }
        [HttpGet("admin/saved-today")]
        public IActionResult GetTodaySavedStats()
        {
            SavedArticle sa = new SavedArticle();

            int total = sa.GetTotalSavedToday();
            var grouped = sa.GetSavedArticlesGroupedToday();

            return Ok(new
            {
                Total = total,
                Articles = grouped.Select(a => new { a.Title, a.Count })
            });
        }


        [HttpPost]
        [Route("save")]
        public IActionResult SaveArticle([FromBody] SavedArticle saved)
        {
            bool success = saved.SaveArticle();

            if (success)
                return Ok("Article saved successfully.");
            else
                return Ok("Article saved successfully."); 
        }


        // POST api/<SavedArticlesController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<SavedArticlesController>/5
        [HttpGet("user/{userId}")]
        public IActionResult GetSavedArticles(int userId)
        {
            var articles = BL.SavedArticle.GetSavedArticles(userId);
            return Ok(articles);
        }


        // DELETE api/<SavedArticlesController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

        [HttpDelete("delete/{userId}/{articleId}")]
        public IActionResult Delete(int userId, int articleId)
        {
            SavedArticle.SoftDelete(userId, articleId);
            return Ok();
        }


    }
}
