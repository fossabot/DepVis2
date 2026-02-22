using System.Net.WebSockets;
using DepVis.Core.Dtos;
using DepVis.Core.Extensions;
using DepVis.Core.Repositories;
using DepVis.Shared.Messages;
using DepVis.Shared.Model;
using LibGit2Sharp;
using MassTransit;
using Microsoft.AspNetCore.OData.Query;

namespace DepVis.Core.Services;

public class ProjectBranchService(ProjectBranchRepository repo, IPublishEndpoint publishEndpoint)
{
    public async Task<ProjectBranchDto> GetProjectBranches(Guid id)
    {
        return (await repo.GetByProjectAsync(id)).MapToBranchesDto();
    }

    public async Task ProcessBranch(Guid id)
    {
        var branch = await repo.GetByIdAsync(id);

        if (branch == null)
            return;

        await repo.DeleteBranchDependencies(id);
        await publishEndpoint.Publish<ProcessingMessage>(
            new()
            {
                GitHubLink = branch.Project.ProjectLink,
                ProjectBranchId = branch.Id,
                Location = branch.Name,
                IsTag = branch.IsTag,
            }
        );
    }

    public async Task<BranchCompareDto> GetComparison(Guid mainBranch, Guid comparedBranchId)
    {
        var mainBranchData = await repo.GetCompareDataAsync(mainBranch);
        var comparedBranchData = await repo.GetCompareDataAsync(comparedBranchId);

        var branchPackages = mainBranchData.PackageNames;
        var comparedPackages = comparedBranchData.PackageNames;

        var branchPackageSet = new HashSet<string>(mainBranchData.PackageNames);
        var comparedPackageSet = new HashSet<string>(comparedBranchData.PackageNames);

        var addedPackages = mainBranchData
            .PackageNames.Where(p => !comparedPackageSet.Contains(p))
            .ToList();

        var removedPackages = comparedBranchData
            .PackageNames.Where(p => !branchPackageSet.Contains(p))
            .ToList();

        var sourceVulnIds = new HashSet<string>(mainBranchData.VulnerabilityIds);
        var targetVulnIds = new HashSet<string>(comparedBranchData.VulnerabilityIds);

        var addedVulnerabilityIds = sourceVulnIds.Except(targetVulnIds).ToList();
        var removedVulnerabilityIds = targetVulnIds.Except(sourceVulnIds).ToList();

        return new BranchCompareDto(
            addedPackages,
            removedPackages,
            addedVulnerabilityIds,
            removedVulnerabilityIds,
            branchPackages.Count,
            comparedPackages.Count,
            sourceVulnIds.Count,
            targetVulnIds.Count
        );
    }

    public async Task<List<ProjectBranchDetailedDto>> GetProjectBranchesDetailed(
        Guid id,
        ODataQueryOptions<ProjectBranch> odata
    )
    {
        var data = await odata.ApplyOdata(repo.QueryByProject(id));
        return [.. data.Select(x => x.MapToBranchesDetailedDto())];
    }

    public async Task<BranchHistoryDto?> GetBranchHistory(
        Guid projectBranchId,
        CancellationToken cancellationToken
    )
    {
        var data = await repo.GetProjectBranchHistory(projectBranchId, cancellationToken);
        return data?.MapToBranchHistoryDto();
    }

    public async Task ProcessHistory(Guid projectBranchId, CancellationToken cancellationToken)
    {
        var branch = await repo.GetByIdAsync(projectBranchId);
        if (branch is null)
            return;

        branch.HistoryProcessingStep = Shared.Model.Enums.ProcessStep.Created;
        await repo.Update(branch, cancellationToken);

        await publishEndpoint.Publish(
            new BranchHistoryProcessingMessage()
            {
                GitHubLink = branch.Project.ProjectLink,
                Location = branch.Name,
                ProjectBranchId = branch.Id,
            },
            cancellationToken
        );
    }
}
