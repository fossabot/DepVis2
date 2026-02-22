FROM mcr.microsoft.com/dotnet/sdk:9.0@sha256:3fcf6f1e809c0553f9feb222369f58749af314af6f063f389cbd2f913b4ad556 AS build
WORKDIR /app

COPY DepVis.Core/DepVis.Core.csproj ./DepVis.Core/
COPY DepVis.ServiceDefaults/DepVis.ServiceDefaults.csproj ./DepVis.ServiceDefaults/
COPY DepVis.Shared/DepVis.Shared.csproj ./DepVis.Shared/
RUN dotnet restore DepVis.Core/DepVis.Core.csproj

COPY . .
RUN dotnet publish DepVis.Core/DepVis.Core.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "DepVis.Core.dll"]