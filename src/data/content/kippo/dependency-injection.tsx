import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';
import { useDocs } from '../../../context/DocsProvider';

const methodInjection = `public class MyHandler : BotUpdateHandler
{
    [Command("profile")]
    public async Task ShowProfile(Context context, IUserService userService)
    {
        // userService is automatically injected from the DI container
        var user = await userService.GetUserAsync(context.ChatId);
        await context.Reply($"Name: {user.Name}");
    }

    [Command("stats")]
    public async Task ShowStats(
        Context context,
        IUserService userService,
        IAnalyticsService analytics)
    {
        var userCount = await userService.GetCountAsync();
        var stats = await analytics.GetStatsAsync();
        await context.Reply($"Users: {userCount}\\nViews: {stats.Views}");
    }
}`;

const scopedServices = `// Program.cs - register scoped services
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlServer(connectionString));
builder.Services.AddScoped<IUserService, UserService>();

// Handler - a new DbContext scope is created automatically per update
[Command("save")]
public async Task SaveUser(Context context, AppDbContext db)
{
    db.Users.Add(new User { TelegramId = context.ChatId });
    await db.SaveChangesAsync();
    await context.Reply("User saved to database!");
}`;

const serviceLifetimes = `// Singleton - shared across the whole app (stateless services, caching)
builder.Services.AddSingleton<ICacheService, CacheService>();

// Scoped - new instance per update (recommended for DbContext)
builder.Services.AddScoped<IUserService, UserService>();

// Transient - new instance every time (lightweight services)
builder.Services.AddTransient<IEmailService, EmailService>();

builder.Services.AddKippo<MyHandler>(builder.Configuration)
                .AddKippoMiddleware<SessionMiddleware>();`;

const constructorInjection = `public class MyHandler : BotUpdateHandler
{
    private readonly IServiceScopeFactory _scopeFactory;

    public MyHandler(IServiceScopeFactory scopeFactory) => _scopeFactory = scopeFactory;

    [Command("data")]
    public async Task GetData(Context context)
    {
        using var scope = _scopeFactory.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IDataService>();
        var data = await service.GetDataAsync();
        await context.Reply($"Data: {data}");
    }
}`;

export default function DependencyInjection() {
  const { resolvedVersion } = useDocs();
  return (
    <>
      <h1>Dependency Injection</h1>
      <p className="lead">
        Kippo fully supports ASP.NET Core dependency injection. Inject services directly
        into handler method parameters, or use constructor injection.
      </p>

      <Callout type="success" title={`Method parameter injection (${resolvedVersion})`}>
        Inject services straight into handler method parameters — the framework resolves
        them from the DI container and creates proper scopes for scoped services.
      </Callout>

      <h2>Method parameter injection</h2>
      <p>The simplest way to use services — add them as method parameters:</p>
      <CodeBlock code={methodInjection} language="csharp" filename="Method Injection" />

      <h2>Scoped services (DbContext)</h2>
      <p>Works seamlessly with scoped services like Entity Framework DbContext:</p>
      <CodeBlock code={scopedServices} language="csharp" filename="Scoped Services" />

      <Callout type="info" title="How it works">
        Kippo creates a new service scope for each update, so scoped services like DbContext
        are disposed properly after every request.
      </Callout>

      <h2>Service lifetimes</h2>
      <CodeBlock code={serviceLifetimes} language="csharp" filename="Service Lifetimes" />

      <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-2 font-semibold text-blue-400">Singleton</h3>
          <p className="text-sm text-zinc-400">One instance for the app lifetime. Stateless services, caching.</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-2 font-semibold text-green-400">Scoped</h3>
          <p className="text-sm text-zinc-400">New instance per update. Recommended for DbContext.</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-2 font-semibold text-purple-400">Transient</h3>
          <p className="text-sm text-zinc-400">New instance every time. Lightweight, stateless services.</p>
        </div>
      </div>

      <h2>Constructor injection (alternative)</h2>
      <p>
        You can also use constructor injection with <code>IServiceScopeFactory</code>:
      </p>
      <CodeBlock code={constructorInjection} language="csharp" filename="Constructor Injection" />

      <Callout type="tip" title="Recommendation">
        Prefer method parameter injection for cleaner code. Use constructor injection when you
        need to share state across methods or control scopes yourself.
      </Callout>

      <h2>Best practices</h2>
      <ul>
        <li>Use <strong>Scoped</strong> for DbContext and per-request stateful services</li>
        <li>Use <strong>Singleton</strong> for stateless services and caching</li>
        <li>Prefer method parameter injection for cleaner code</li>
        <li>Use interfaces for services to enable testing</li>
        <li>Don't inject scoped services into singletons</li>
      </ul>
    </>
  );
}
