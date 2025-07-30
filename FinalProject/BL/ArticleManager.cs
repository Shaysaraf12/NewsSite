using FinalProject.DAL;
using FinalProject.BL;
using Newtonsoft.Json;
using System.Net.Http;
using System;
using System.Globalization;

public static class ArticleManager
{
    //Import News from api
    public static void ImportFromNewsApi(string source)
    {
        string url = source switch
        {
            "apple" => "https://newsapi.org/v2/everything?q=apple&from=2025-07-27&to=2025-07-27&sortBy=popularity&apiKey=06c23796836342b7ade23bf47c40778f",
            "tesla" => "https://newsapi.org/v2/everything?q=tesla&from=2025-06-28&sortBy=publishedAt&apiKey=06c23796836342b7ade23bf47c40778f",
            "business" => "https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=06c23796836342b7ade23bf47c40778f",
            "techcrunch" => "https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=06c23796836342b7ade23bf47c40778f",
            "wallstreet" => "https://newsapi.org/v2/everything?domains=wsj.com&apiKey=06c23796836342b7ade23bf47c40778f",
            _ => throw new ArgumentException("Invalid source")
        };

        using (HttpClient client = new HttpClient())
        {
            client.DefaultRequestHeaders.Add("User-Agent", "MyFinalProjectApp");
            var response = client.GetAsync(url).Result;

            if (response.IsSuccessStatusCode)
            {
                var json = response.Content.ReadAsStringAsync().Result;
                dynamic data = JsonConvert.DeserializeObject(json);

                if (data != null && data.articles != null)
                {
                    foreach (var article in data.articles)
                    {
                        DateTime publishedAt;
                        try
                        {
                            string rawDate = (string)article.publishedAt;
                            publishedAt = DateTime.Parse(rawDate, null, System.Globalization.DateTimeStyles.RoundtripKind);
                        }
                        catch
                        {
                            publishedAt = DateTime.Now;
                        }

                        Article a = new Article
                        {
                            Title = article.title != null ? (string)article.title : "",
                            Description = article.description != null ? (string)article.description : "",
                            Url = article.url != null ? (string)article.url : "",
                            UrlToImage = article.urlToImage != null ? (string)article.urlToImage : "",
                            PublishedAt = publishedAt,
                            Content = article.content != null ? (string)article.content : "",
                            Author = article.author != null ? (string)article.author : "",
                            Source = new Source
                            {
                                Name = article.source != null && article.source.name != null ? (string)article.source.name : ""
                            }
                        };

                        try
                        {
                            DBservices.InsertArticleToDB(a);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"❌ שגיאה בהכנסת כתבה: {a.Title}\n{ex.Message}");
                        }
                    }

                    DBservices.InsertNewsPullLog();
                }
            }
        }
    }
    public static int GetNewsPullCount()
    {
        return DBservices.GetNewsPullCount();
    }

}
