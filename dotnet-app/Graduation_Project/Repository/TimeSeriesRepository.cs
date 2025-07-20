using Graduation_Project.DTO;
using Graduation_Project.Models;
using Graduation_Project.Repository;
using NetTopologySuite.IO;



namespace Graduation_Project.Repository
{
    public interface ITimeSeriesRepository
    {
        IEnumerable<ShoreLinesDTO> GetAll();
    }
    public class TimeSeriesRepository : ITimeSeriesRepository
    {
        Final_ProjectContext context;
        GeoJsonWriter geoWriter;
        public TimeSeriesRepository(Final_ProjectContext CTX)
        {
            context = CTX;
            geoWriter = new GeoJsonWriter();
        }
        public IEnumerable<ShoreLinesDTO> GetAll()
        {
            return context.SHORELINES_1986_2100s
                .Where(s => s.Shape != null)
                .Select(s => new ShoreLinesDTO
                {
                    Id = s.OBJECTID,
                    Year = s.Year,
                    Geometry = geoWriter.Write(s.Shape),
                }).ToList();
        }
    }
}