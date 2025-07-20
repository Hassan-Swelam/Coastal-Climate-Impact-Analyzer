using Graduation_Project.Models;

namespace Graduation_Project.Repository
{
    public interface ICVIRepository
    {
        IEnumerable<SHORELINE_2023_CVI_1KM> CVI_Before();
        IEnumerable<SHORELINE_2023_AFTER> CVI_After();
    }
    public class CVIRepository : ICVIRepository
    {
        Final_ProjectContext context;
        public CVIRepository(Final_ProjectContext CTX)
        {
            context = CTX;
        }

        public IEnumerable<SHORELINE_2023_CVI_1KM> CVI_Before()
        {
            return context.SHORELINE_2023_CVI_1KMs.ToList();
        }

        public IEnumerable<SHORELINE_2023_AFTER> CVI_After()
        {
            return context.SHORELINE_2023_AFTERs.ToList();
        }

    }
}