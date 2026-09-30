FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["backend/SupportFlow.Api/SupportFlow.Api.csproj", "backend/SupportFlow.Api/"]
COPY ["backend/SupportFlow.Application/SupportFlow.Application.csproj", "backend/SupportFlow.Application/"]
COPY ["backend/SupportFlow.Domain/SupportFlow.Domain.csproj", "backend/SupportFlow.Domain/"]
COPY ["backend/SupportFlow.Infrastructure/SupportFlow.Infrastructure.csproj", "backend/SupportFlow.Infrastructure/"]

RUN dotnet restore "backend/SupportFlow.Api/SupportFlow.Api.csproj"

COPY . .

WORKDIR "/src/backend/SupportFlow.Api"
RUN dotnet publish "SupportFlow.Api.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

FROM base AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "SupportFlow.Api.dll"]