using NetTopologySuite.Geometries;

namespace Graduation_Project.DTO
{
    public class UserLocationDTO
    {
        public int Id { get; set; } 
        public Geometry? Location{ get; set; }
    }
}
