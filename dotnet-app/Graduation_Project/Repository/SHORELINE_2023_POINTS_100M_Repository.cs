using Graduation_Project.Models;

namespace Graduation_Project.Repository
{
    public interface ISHORELINE_2023_POINTS_100M_Repository : IRepository<SHORELINE_2023_POINTS_100M>
    {

    }
    public class SHORELINE_2023_POINTS_100M_Repository : ISHORELINE_2023_POINTS_100M_Repository
    {
        public Final_ProjectContext Context;
        public SHORELINE_2023_POINTS_100M_Repository(Final_ProjectContext ctx)
        {
            Context = ctx;
        }
        public List<SHORELINE_2023_POINTS_100M> GetAll()
        {
            return Context.SHORELINE_2023_POINTS_100Ms.ToList();
        }

        public SHORELINE_2023_POINTS_100M GetById(int id)
        {
            return Context.SHORELINE_2023_POINTS_100Ms.FirstOrDefault(c => c.OBJECTID == id);
        }


    }
}
