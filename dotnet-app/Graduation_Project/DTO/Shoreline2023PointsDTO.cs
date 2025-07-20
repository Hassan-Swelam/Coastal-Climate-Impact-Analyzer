using NetTopologySuite.Geometries;

namespace Graduation_Project.DTO
{
    public class Shoreline2023PointsDTO
    {
        public int Id { get; set; }

        public Geometry? Geometry { get; set; }

        public decimal? Coastal_Slope { get; set; }

        public decimal? Current_Position_X { get; set; }

        public decimal? Current_Position_Y { get; set; }

        public decimal? Elevation { get; set; }

        public decimal? LRR { get; set; }

        public decimal? Sea_Level_Rise_Trend_mm_year { get; set; }

        public decimal? NSM { get; set; }
    }
}
