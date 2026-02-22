using DepVis.Core.Context;
using DepVis.Core.Dtos;
using DepVis.Shared.Model;
using DepVis.Shared.Services;
using Microsoft.EntityFrameworkCore;

namespace DepVis.Core.Repositories;

public class ProjectBranchRepository(DepVisDbContext context, MinioStorageService minio)
{
    public async Task<ProjectBranch?> GetByIdAsync(Guid id) =>
        await context
            .ProjectBranches.Include(x => x.Project)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

    public async Task<BranchCompareDataModel> GetCompareDataAsync(Guid id)
    {
        var baseQuery = context
            .SbomPackages.AsNoTracking()
            .Where(p => p.Sbom.ProjectBranchId == id || p.Sbom.BranchHistoryId == id);

        var packageNamesTask = await baseQuery.Select(p => p.Name).Distinct().ToListAsync();

        var vulnerabilityIdsTask = await baseQuery
            .SelectMany(p => p.Vulnerabilities.Select(v => v.Id))
            .Distinct()
            .ToListAsync();

        return new BranchCompareDataModel(id, packageNamesTask, vulnerabilityIdsTask);
    }

    public async Task<List<ProjectBranch>> GetByProjectAsync(Guid projectId) =>
        await context
            .ProjectBranches.AsNoTracking()
            .Include(x => x.BranchHistories)
            .Where(x => x.ProjectId == projectId)
            .ToListAsync();

    public async Task<ProjectBranch?> GetProjectBranchHistory(
        Guid projectBranchId,
        CancellationToken cancellationToken = default
    ) =>
        await context
            .ProjectBranches.AsNoTracking()
            .Where(x => x.Id == projectBranchId)
            .Include(x => x.BranchHistories)
            .FirstOrDefaultAsync(cancellationToken);

    public IQueryable<ProjectBranch> QueryByProject(Guid projectId) =>
        context
            .ProjectBranches.Include(x => x.Sboms)
            .AsNoTracking()
            .Where(x => x.ProjectId == projectId);

    public async Task DeleteBranchDependencies(Guid projectBranchId)
    {
        using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            var packageDependencies = context.PackageDependencies.Where(pd =>
                (pd.Parent.Sbom.ProjectBranchId == projectBranchId)
                || (pd.Child.Sbom.ProjectBranchId == projectBranchId)
            );
            await packageDependencies.ExecuteDeleteAsync();

            var sbomPackageVulnerabilities = context.SbomPackageVulnerabilities.Where(pv =>
                pv.SbomPackage.Sbom.ProjectBranchId == projectBranchId
            );
            await sbomPackageVulnerabilities.ExecuteDeleteAsync();

            var sbomPackages = context.SbomPackages.Where(sp =>
                sp.Sbom.ProjectBranchId == projectBranchId
            );
            await sbomPackages.ExecuteDeleteAsync();

            var sboms = context.Sboms.Where(s => s.ProjectBranchId == projectBranchId);

            foreach (var sbom in await sboms.ToListAsync())
            {
                await minio.DeleteAsync(sbom.FileName);
            }

            await sboms.ExecuteDeleteAsync();

            await transaction.CommitAsync();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new InvalidOperationException("Error deleting branches and associated data.", ex);
        }
    }

    public Task Update(ProjectBranch projectBranch, CancellationToken cancellationToken = default)
    {
        context.ProjectBranches.Update(projectBranch);
        return context.SaveChangesAsync(cancellationToken);
    }
}
