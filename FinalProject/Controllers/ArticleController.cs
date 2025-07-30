using Microsoft.AspNetCore.Mvc;
using FinalProject;
using FinalProject.BL;


namespace FinalProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArticleController : ControllerBase
    {
        // GET: api/<ArticleController>
        [HttpGet]
        public IEnumerable<Article> Get()
        {
            return Article.GetArticles();
        }
        [HttpGet("search")]
        public IEnumerable<Article> SearchArticles([FromQuery] string query)
        {
            return Article.SearchArticles(query);
        }
        [HttpGet("byDate/{from}/{to}")]
        public IEnumerable<Article> GetByDateRange(DateTime from, DateTime to)
        {
            return Article.GetArticlesByDateRange(from, to);
        }



        [HttpGet("deleted")]
        public ActionResult<List<Article>> GetDeletedArticles()
        {
            List<Article> deletedArticles = Article.GetDeletedArticles();
            return Ok(deletedArticles);
        }

        [HttpPut("restore/{id}")]
        public ActionResult RestoreArticle(int id)
        {
            Article.Restore(id);
            return Ok();
        }


        [HttpGet("summarize/{id}")]
        public async Task<IActionResult> Summarize(int id)
        {
            Article article = Article.GetById(id);
            if (article == null)
                return NotFound("article not found.");

            string summary = await article.SummarizeAsync();
            return Ok(new { summary });
        }





        // GET api/<ArticleController>/5
        [HttpGet("getbyid/{id}")]
        public Article GetById(int id)
        {
            return Article.GetById(id);
        }

        [HttpPost("import/{source}")]
        public IActionResult ImportArticlesBySource(string source)
        {
            ArticleManager.ImportFromNewsApi(source);
            return Ok();
        }

        [HttpGet("pull-count")]
        public IActionResult GetNewsPullCount()
        {
            int count = ArticleManager.GetNewsPullCount();
            return Ok(count);
        }




        // POST api/<ArticleController>
        [HttpPost]
        public IActionResult AddArticle([FromBody] Article article)
        {
            Article.InsertArticle(article);
            return Ok();
        }


        // PUT api/<ArticleController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

     


        // DELETE api/<ArticleController>/5
        [HttpDelete("{id}")]
        public IActionResult SoftDelete(int id)
        {
            Article a = new Article();
            a.Id = id;
            a.SoftDelete();
            return Ok();
        }
    }
}
