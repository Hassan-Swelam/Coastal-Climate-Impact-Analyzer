using Graduation_Project.DTO;
using Graduation_Project.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Graduation_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TimeSeriesController : ControllerBase
    {
        ITimeSeriesRepository timeseriesRepo;
        public TimeSeriesController(ITimeSeriesRepository _timeseriesRepo)
        {
            timeseriesRepo = _timeseriesRepo;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            IEnumerable<ShoreLinesDTO> shorelines = timeseriesRepo.GetAll();
            return Ok(shorelines);
        }
    }
}