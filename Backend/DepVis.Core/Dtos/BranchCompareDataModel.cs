namespace DepVis.Core.Dtos;

public record BranchCompareDataModel(
    Guid Id,
    List<string> PackageNames,
    List<string> VulnerabilityIds
);

public record BranchCompareDto(
    List<string> AddedPackages,
    List<string> RemovedPackages,
    List<string> AddedVulnerabilityIds,
    List<string> RemovedVulnerabilityIds,
    int mainBranchPackageCount,
    int comparedBranchPackageCount,
    int mainBranchVulnerabilityCount,
    int comparedBranchVulnerabilityCount
);
