using DepVis.Core.Dtos;
using DepVis.Core.Services;
using DepVis.Core.Util;
using DepVis.Shared.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;

namespace DepVis.Core.Controllers;

[Route("api/projects")]
[ApiController]
public class ProjectBranchesController(
    ProjectBranchService branchService,
    ProjectService projectService
) : ControllerBase
{
    [HttpGet("{projectId}/branches")]
    public async Task<ActionResult<ProjectBranchDto>> GetProjectBranches(Guid projectId)
    {
        var branches = await branchService.GetProjectBranches(projectId);
        return Ok(branches);
    }

    [HttpPost("{projectId}/branches/{projectBranchId}/process")]
    public async Task<ActionResult<ProjectBranchDto>> ProcessBranch(Guid projectBranchId)
    {
        await branchService.ProcessBranch(projectBranchId);
        return Ok();
    }

    [HttpGet("{projectId}/branches/detailed")]
    public async Task<ActionResult<List<ProjectBranchDetailedDto>>> GetProjectBranchesDetailed(
        Guid projectId,
        ODataQueryOptions<ProjectBranch> odata,
        [FromQuery(Name = "$export")] bool export = false
    )
    {
        var detailed = await branchService.GetProjectBranchesDetailed(projectId, odata);

        if (export)
        {
            var rows = detailed;
            var stream = await CsvExport.WriteToCsvStreamAsync(rows);
            stream.Position = 0;
            return File(stream, "text/csv", $"branches-{projectId}-{DateTime.Now}.csv");
        }

        return Ok(detailed);
    }

    [HttpGet("{branchId}/compare/{comparedWith}")]
    public async Task<ActionResult<ProjectStatsDto>> GetBranchComparison(
        Guid branchId,
        Guid comparedWith
    )
    {
        var stats = await branchService.GetComparison(branchId, comparedWith);
        return stats is null ? NotFound() : Ok(stats);
    }

    [HttpGet("{projectId}/stats")]
    public async Task<ActionResult<ProjectStatsDto>> GetProjectStats(Guid projectId)
    {
        var stats = await projectService.GetProjectStats(projectId);
        return stats is null ? NotFound() : Ok(stats);
    }

    [HttpGet("{branchId}/branches/history")]
    public async Task<ActionResult<BranchHistoryDto>> GetBranchHistory(
        Guid branchId,
        CancellationToken cancellationToken
    )
    {
        var data = await branchService.GetBranchHistory(branchId, cancellationToken);
        return data is null ? NotFound() : Ok(data);
    }

    [HttpPost("{branchId}/branches/history")]
    public async Task<ActionResult> ProcessBranchHistory(
        Guid branchId,
        CancellationToken cancellationToken
    )
    {
        await branchService.ProcessHistory(branchId, cancellationToken);
        return Ok();
    }
}
