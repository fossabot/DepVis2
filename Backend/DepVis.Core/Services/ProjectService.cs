using DepVis.Core.Dtos;
using DepVis.Core.Extensions;
using DepVis.Shared.Messages;
using DepVis.Shared.Model;
using MassTransit;

public class ProjectService(ProjectRepository repo, IPublishEndpoint publishEndpoint)
{
    public async Task<IEnumerable<ProjectDto>> GetProjects() =>
        (await repo.GetAllAsync()).Select(x => x.MapToDto());

    public async Task<EditProjectDto?> GetEditProject(Guid id)
    {
        var project = await repo.GetByIdAsync(id);
        return project is null
            ? null
            : new EditProjectDto()
            {
                Branches = project
                    .ProjectBranches.Where(x => !x.IsTag)
                    .Select(x => x.Name)
                    .ToList(),
                Tags = project.ProjectBranches.Where(x => x.IsTag).Select(x => x.Name).ToList(),
                Name = project.Name,
                ProjectLink = project.ProjectLink,
                Id = project.Id,
            };
    }

    public async Task<ProjectDto?> GetProject(Guid id)
    {
        var project = await repo.GetByIdAsync(id);
        return project is null ? null : project.MapToDto();
    }

    public async Task<ProjectDto> CreateProject(CreateProjectDto dto)
    {
        var projectId = Guid.NewGuid();
        var project = new Project
        {
            Id = projectId,
            Name = dto.Name,
            ProjectType = dto.ProjectType,
            ProjectLink = dto.ProjectLink,
            ProjectBranches =
            [
                .. dto.Branches.Select(b => new ProjectBranch
                {
                    IsTag = false,
                    Name = b,
                    ProjectId = projectId,
                }),
                .. dto.Tags.Select(t => new ProjectBranch
                {
                    IsTag = true,
                    Name = t,
                    ProjectId = projectId,
                }),
            ],
        };

        if (project.ProjectBranches.Count == 0)
            project.ProjectBranches.Add(
                new ProjectBranch
                {
                    IsTag = false,
                    Name = "master",
                    ProjectId = projectId,
                }
            );

        await repo.AddAsync(project);

        await PublishBranchesForProcessing([.. project.ProjectBranches], project.ProjectLink);

        return project.MapToDto();
    }

    public async Task<ProjectStatsDto?> GetProjectStats(Guid branchId) =>
        (await repo.GetProjectStatsAsync(branchId))?.MapToDto();

    public async Task<bool> UpdateProject(Guid id, UpdateProjectDto dto)
    {
        var project = await repo.GetByIdAsync(id);
        if (project is null)
            return false;

        var newBranches = dto
            .Branches.Select(b => new ProjectBranch
            {
                IsTag = false,
                Name = b,
                ProjectId = id,
            })
            .ToList();

        var newTags = dto
            .Tags.Select(t => new ProjectBranch
            {
                IsTag = true,
                Name = t,
                ProjectId = id,
            })
            .ToList();

        var combinedBranches = newBranches.Concat(newTags).ToList();

        var branchesToRemove = project
            .ProjectBranches.Where(existingBranch =>
                !combinedBranches.Any(newBranch =>
                    newBranch.Name == existingBranch.Name && newBranch.IsTag == existingBranch.IsTag
                )
            )
            .ToList();

        await repo.RemoveBranchesAsync(project.Id, branchesToRemove.Select(x => x.Name).ToList());

        var branchesToAdd = combinedBranches
            .Where(newBranch =>
                !project.ProjectBranches.Any(existingBranch =>
                    existingBranch.Name == newBranch.Name && existingBranch.IsTag == newBranch.IsTag
                )
            )
            .ToList();

        await repo.AddBranchesAsync(branchesToAdd);

        await PublishBranchesForProcessing(branchesToAdd, project.ProjectLink);

        return true;
    }

    public async Task<bool> DeleteProject(Guid id)
    {
        var project = await repo.GetByIdDetailedAsync(id);
        if (project is null)
            return false;

        await repo.DeleteAsync(project);
        return true;
    }

    private async Task PublishBranchesForProcessing(
        List<ProjectBranch> branches,
        string projectLink
    )
    {
        foreach (var branch in branches)
        {
            await publishEndpoint.Publish<ProcessingMessage>(
                new()
                {
                    GitHubLink = projectLink,
                    ProjectBranchId = branch.Id,
                    Location = branch.Name,
                    IsTag = branch.IsTag,
                }
            );
        }
    }
}
