import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';

const middlewareInterface = `namespace Kippo;

public interface IBotMiddleware
{
    Task InvokeAsync(Context context, Func<Task> next);
}`;

const registerMiddleware = `var builder = WebApplication.CreateBuilder(args);

builder.Services.AddKippo<MyHandler>(builder.Configuration)
                .AddKippoMiddleware<LoggingMiddleware>()
                .AddKippoMiddleware<SessionMiddleware>();

var app = builder.Build();
app.Run();`;

const loggingMiddleware = `public class LoggingMiddleware : IBotMiddleware
{
    private readonly ILogger<LoggingMiddleware> _logger;

    public LoggingMiddleware(ILogger<LoggingMiddleware> logger) => _logger = logger;

    public async Task InvokeAsync(Context context, Func<Task> next)
    {
        var userId = context.Update.Message?.From?.Id ??
                     context.Update.CallbackQuery?.From?.Id ?? 0;

        _logger.LogInformation("Update from {UserId}: {Type}", userId, context.Update.Type);

        var sw = System.Diagnostics.Stopwatch.StartNew();
        await next(); // Continue to next middleware or handler
        sw.Stop();

        _logger.LogInformation("Processed in {ElapsedMs}ms", sw.ElapsedMilliseconds);
    }
}`;

const authMiddleware = `public class AuthMiddleware : IBotMiddleware
{
    private readonly HashSet<long> _allowedUsers;

    public AuthMiddleware(IConfiguration config)
    {
        var ids = config.GetSection("Bot:AllowedUsers").Get<long[]>() ?? Array.Empty<long>();
        _allowedUsers = new HashSet<long>(ids);
    }

    public async Task InvokeAsync(Context context, Func<Task> next)
    {
        var userId = context.Update.Message?.From?.Id ??
                     context.Update.CallbackQuery?.From?.Id;

        if (!userId.HasValue) { await next(); return; }

        if (_allowedUsers.Count == 0 || _allowedUsers.Contains(userId.Value))
            await next(); // User is authorized
        else
            await context.Reply("Access denied. You are not authorized to use this bot.");
    }
}`;

const rateLimitMiddleware = `public class RateLimitMiddleware : IBotMiddleware
{
    private readonly ConcurrentDictionary<long, DateTime> _lastRequest = new();
    private readonly TimeSpan _cooldown;

    public RateLimitMiddleware(IConfiguration config)
        => _cooldown = TimeSpan.FromSeconds(config.GetValue<int>("Bot:RateLimitSeconds", 2));

    public async Task InvokeAsync(Context context, Func<Task> next)
    {
        var userId = context.Update.Message?.From?.Id ??
                     context.Update.CallbackQuery?.From?.Id;
        if (!userId.HasValue) { await next(); return; }

        var now = DateTime.UtcNow;
        if (_lastRequest.TryGetValue(userId.Value, out var last) && now - last < _cooldown)
        {
            await context.Reply("Please wait before sending another message.");
            return;
        }

        _lastRequest[userId.Value] = now;
        await next();
    }
}`;

const errorHandlingMiddleware = `public class ErrorHandlingMiddleware : IBotMiddleware
{
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(ILogger<ErrorHandlingMiddleware> logger) => _logger = logger;

    public async Task InvokeAsync(Context context, Func<Task> next)
    {
        try
        {
            await next();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing update {UpdateId}", context.Update.Id);
            try { await context.Reply("An error occurred. Please try again later."); }
            catch { /* ignore */ }
        }
    }
}`;

const middlewareOrder = `// Middleware executes in registration order
builder.Services.AddKippo<MyHandler>(builder.Configuration)
    .AddKippoMiddleware<ErrorHandlingMiddleware>()  // 1. Catches all errors
    .AddKippoMiddleware<LoggingMiddleware>()        // 2. Logs requests
    .AddKippoMiddleware<RateLimitMiddleware>()      // 3. Rate limiting
    .AddKippoMiddleware<AuthMiddleware>()           // 4. Authentication
    .AddKippoMiddleware<SessionMiddleware>();       // 5. Session management

// Pipeline: Request → Error → Logging → RateLimit → Auth → Session → Handler`;

export default function Middleware() {
  return (
    <>
      <h1>Middleware</h1>
      <p className="lead">
        Extend Kippo with custom middleware. Middleware runs as a pipeline before your
        handlers — add logging, authentication, rate limiting, and more.
      </p>

      <h2>How middleware works</h2>
      <p>Each update flows through the pipeline before reaching your handler:</p>
      <div className="my-4 rounded-lg bg-zinc-800/50 p-4 font-mono text-sm text-zinc-300">
        <p>Update → Middleware 1 → Middleware 2 → … → Handler</p>
        <p className="mt-2">Response ← Middleware 1 ← Middleware 2 ← … ← Handler</p>
      </div>
      <p>Each middleware can run code before the handler, call <code>next()</code> to continue,
        run code after, or short-circuit by not calling <code>next()</code>.</p>

      <h2>IBotMiddleware interface</h2>
      <CodeBlock code={middlewareInterface} language="csharp" filename="IBotMiddleware.cs" />

      <h2>Registering middleware</h2>
      <CodeBlock code={registerMiddleware} language="csharp" filename="Program.cs" />

      <h2>Logging middleware</h2>
      <CodeBlock code={loggingMiddleware} language="csharp" filename="LoggingMiddleware.cs" />

      <h2>Authentication middleware</h2>
      <CodeBlock code={authMiddleware} language="csharp" filename="AuthMiddleware.cs" />

      <h2>Rate limiting middleware</h2>
      <CodeBlock code={rateLimitMiddleware} language="csharp" filename="RateLimitMiddleware.cs" />

      <h2>Error handling middleware</h2>
      <CodeBlock code={errorHandlingMiddleware} language="csharp" filename="ErrorHandlingMiddleware.cs" />

      <h2>Middleware order</h2>
      <p>Middleware executes in registration order — order matters.</p>
      <CodeBlock code={middlewareOrder} language="csharp" filename="Middleware Order" />

      <Callout type="tip" title="Ordering tip">
        Place error-handling middleware first so it catches errors from everything else, and
        session middleware last so sessions are available in handlers.
      </Callout>
    </>
  );
}
