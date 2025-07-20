namespace Graduation_Project.Repository
{
    public interface IRepository<T>
    {
        List<T> GetAll();
        T GetById(int id);

    }
}
