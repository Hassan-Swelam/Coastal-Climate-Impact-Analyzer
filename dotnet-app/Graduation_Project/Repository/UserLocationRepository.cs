
using Graduation_Project.Models;

namespace Graduation_Project.Repository
{
    public interface IUserLocationRepository : IRepository<UserLocation>
    {
    }
    public class UserLocationRepository : IUserLocationRepository
    {
        public Final_ProjectContext Context;
        public UserLocationRepository(Final_ProjectContext ctx)
        {
            Context = ctx;
        }
        public List<UserLocation> GetAll()
        {
            return Context.UserLocations.ToList();
        }

        public UserLocation GetById(int id)
        {
            return Context.UserLocations.FirstOrDefault(c => c.Id == id);
        }

    }
}
