using Graduation_Project.DTO;
using Graduation_Project.Models;

namespace Graduation_Project.Repository
{
    public interface ISHORELINE_2023_SEGMENTED_PROJECT_Repository : IRepository<SHORELINE_2023_SEGMENTED_PROJECT>
    {
        SHORELINE_2023_SEGMENTED_PROJECT GetNearestToLocation(UserLocationDTO userLocation);
    }
    public class SHORELINE_2023_SEGMENTED_PROJECT_Repository : ISHORELINE_2023_SEGMENTED_PROJECT_Repository
    {
        public Final_ProjectContext context;
        public SHORELINE_2023_SEGMENTED_PROJECT_Repository(Final_ProjectContext ctx)
        {
            context = ctx;
        }
        public List<SHORELINE_2023_SEGMENTED_PROJECT> GetAll()
        {
            return context.SHORELINE_2023_SEGMENTED_PROJECTs.ToList();
        }

        public SHORELINE_2023_SEGMENTED_PROJECT GetById(int id)
        {
            throw new NotImplementedException();
        }

        SHORELINE_2023_SEGMENTED_PROJECT ISHORELINE_2023_SEGMENTED_PROJECT_Repository.GetNearestToLocation(UserLocationDTO userLocation)
        {
            throw new NotImplementedException();
        }
    }
}
