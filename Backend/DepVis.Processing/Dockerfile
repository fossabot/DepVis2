FROM mcr.microsoft.com/dotnet/sdk:9.0@sha256:3fcf6f1e809c0553f9feb222369f58749af314af6f063f389cbd2f913b4ad556 AS build
WORKDIR /app

COPY DepVis.Processing/DepVis.SbomProcessing.csproj ./DepVis.Processing/
COPY DepVis.ServiceDefaults/DepVis.ServiceDefaults.csproj ./DepVis.ServiceDefaults/
COPY DepVis.Shared/DepVis.Shared.csproj ./DepVis.Shared/
RUN dotnet restore DepVis.Processing/DepVis.SbomProcessing.csproj

COPY . .
RUN dotnet publish DepVis.Processing/DepVis.SbomProcessing.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/runtime:9.0 AS runtime
ARG TRIVY_VERSION=v0.67.2

RUN apt-get update \
    && apt-get install -y curl ca-certificates tar \
    && curl -L --fail --show-error --connect-timeout 20 --retry 3 \
    "https://github.com/aquasecurity/trivy/releases/download/${TRIVY_VERSION}/trivy_${TRIVY_VERSION#v}_Linux-64bit.tar.gz" \
    -o /tmp/trivy.tar.gz \
    && tar -xzf /tmp/trivy.tar.gz -C /usr/local/bin trivy \
    && rm /tmp/trivy.tar.gz \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "DepVis.SbomProcessing.dll"]