using Microsoft.AspNetCore.Mvc;
using Graduation_Project.Repository;
using Graduation_Project.DTO;
using NetTopologySuite.Algorithm.Distance;
using NetTopologySuite.Geometries;
using Graduation_Project.Models;
using Newtonsoft.Json;
using NetTopologySuite.IO;
using System.Drawing;

namespace Graduation_Project.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoastlineController : ControllerBase
    {
        ISHORELINE_2023_SEGMENTED_PROJECT_Repository _segmentRepo;
        ISHORELINE_2023_POINTS_100M_Repository _pointsRepo;

        // Initialize GeoJSON writer
        private readonly GeoJsonWriter _geoJsonWriter;

        public CoastlineController(ISHORELINE_2023_SEGMENTED_PROJECT_Repository segmentRepo, 
            ISHORELINE_2023_POINTS_100M_Repository pointsRepo)
        {
            _segmentRepo = segmentRepo;
            _pointsRepo = pointsRepo;

            // Initialize GeoJSON writer
            _geoJsonWriter = new GeoJsonWriter();
        }

        [HttpGet("segments")]
        public IActionResult GetSegments()
        {
            try
            {
                var segments = _segmentRepo.GetAll();

                // Convert to GeoJSON format
                var geoJsonFeatures = segments.Select(segment => new
                {
                    type = "Feature",
                    geometry = _geoJsonWriter.Write(segment.shape),
                    properties = new
                    {
                        id = segment.objectid,
                        uncertainty=segment.uncertainty,
                        Date=segment.date_
                    }
                }).ToList();

                var geoJsonResult = new
                {
                    type = "FeatureCollection",
                    features = geoJsonFeatures
                };

                return Ok(geoJsonResult);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error converting segments to GeoJSON: {ex.Message}");
            }
        }

        [HttpGet("points")]
        public IActionResult GetPoints()
        {
            try
            {
                IEnumerable<SHORELINE_2023_POINTS_100M> points = _pointsRepo.GetAll();

                // Convert to GeoJSON format
                var geoJsonFeatures = points.Select(point => new
                {
                    type = "Feature",
                    geometry = _geoJsonWriter.Write(point.Shape),
                    properties = new
                    {
                        id = point.OBJECTID,
                        coastal_Slope = point.Coastal_Slope,
                        current_Position_X = point.Current_Position_X,
                        current_Position_Y = point.Current_Position_Y,
                        elevation = point.Elevation,
                        lrr = point.LRR,
                        sea_Level_Rise_Trend_mm_year = point.Sea_Level_Rise_Trend_mm_year, // Fixed: LRR is used for sea level rise trend
                        nsm = point.NSM,
                        Geometry = _geoJsonWriter.Write(point.Shape)
                    }
                }).ToList();

                var geoJsonResult = new
                {
                    type = "FeatureCollection",
                    features = geoJsonFeatures
                };

                return Ok(geoJsonResult);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error converting points to GeoJSON: {ex.Message}");
            }
        }
    }
}