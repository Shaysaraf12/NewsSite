namespace FinalProject.BL
{
    public class Source
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public Source() { }
        public List<Article> Articles { get; set; } = new List<Article>();


        public Source(int id, string name)
        {
            Id = id;
            Name = name;
        }
    }

}
