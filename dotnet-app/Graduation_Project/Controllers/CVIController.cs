using Graduation_Project.Models;
using Graduation_Project.Repository;
using Microsoft.AspNetCore.Mvc;
using NetTopologySuite.IO;
using Graduation_Project.DTO;


namespace Graduation_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CVIController : ControllerBase
    {
        ICVIRepository cviRepo;
        GeoJsonWriter geoWriter;
        public CVIController(ICVIRepository _cviRepo)
        {
            cviRepo = _cviRepo;
            geoWriter = new GeoJsonWriter();
        }

        [HttpGet("Before")]
        public IActionResult GetCVIBefore()
        {
            IEnumerable<SHORELINE_2023_CVI_1KM> segments = cviRepo.CVI_Before();
            var geoSegments = segments.Select(s => new CVIBeforeDTO
            {
                Id_B = s.objectid,
                CVIRank_B = s.cvi_rank,
                Geometry_B = geoWriter.Write(s.shape)
            });
            return Ok(geoSegments);
        }

        [HttpGet("After")]
        public IActionResult GetCVIAfter()
        {
            IEnumerable<SHORELINE_2023_AFTER> segments = cviRepo.CVI_After();
            var geoSegments = segments.Select(s => new CVIAfterDTO
            {
                Id_A = s.OBJECTID,
                CVIRank_A = s.CVI_Rank,
                Geometry_A = geoWriter.Write(s.Shape)
            });
            return Ok(geoSegments);
        }
    }
}