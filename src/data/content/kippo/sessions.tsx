import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';

const enableSession = `// Program.cs
using Kippo.Extensions;
using Kippo.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddKippo<MyHandler>(builder.Configuration)
                .AddKippoMiddleware<SessionMiddleware>(); // Enable sessions

var app = builder.Build();
app.Run();`;

const sessionBasics = `[Command("start")]
public async Task Start(Context context)
{
    context.Session!.State = "awaiting_name";
    context.Session.Data["started_at"] = DateTime.Now;
    await context.Reply("What's your name?");
}

[Text(State = "awaiting_name")]
public async Task HandleName(Context context)
{
    context.Session!.Data["name"] = context.Message.Text;
    context.Session.State = "awaiting_age";
    await context.Reply($"Nice to meet you! How old are you?");
}

[Text(State = "awaiting_age")]
public async Task HandleAge(Context context)
{
    if (int.TryParse(context.Message.Text, out var age))
    {
        context.Session!.Data["age"] = age;
        context.Session.State = null; // Registration complete
        await context.Reply($"Registration complete! Age: {age}");
    }
    else
    {
        await context.Reply("Please enter a valid number");
    }
}`;

const sessionProperties = `// State - track conversation flow
context.Session!.State = "awaiting_input";
var currentState = context.Session.State;

// Data - store any serializable data
context.Session.Data["key"] = value;
context.Session.Data["user_id"] = 12345;

// Retrieve data
var name = context.Session.Data["name"];
var age = (int)context.Session.Data["age"];

// Get with default
var country = context.Session.Data.GetValueOrDefault("country", "Unknown");

// Clear all session data
context.Session.State = null;
context.Session.Data.Clear();`;

const sessionClass = `public class Session
{
    public long UserId { get; set; }
    public string? State { get; set; }
    public ConcurrentDictionary<string, object> Data { get; set; } = new();
}`;

const sessionInterface = `public interface ISessionStore
{
    Task<Session> GetAsync(long chatId);
    Task SaveAsync(long chatId, Session session);
    Task<bool> DeleteAsync(long chatId);
}`;

const redisSessionStorage = `using Kippo.SessionStorage;
using StackExchange.Redis;
using System.Text.Json;

public class RedisSessionStorage : ISessionStore
{
    private readonly IDatabase _db;
    private readonly TimeSpan _expiry = TimeSpan.FromDays(7);

    public RedisSessionStorage(IConnectionMultiplexer redis) => _db = redis.GetDatabase();

    public async Task<Session> GetAsync(long chatId)
    {
        var json = await _db.StringGetAsync($"session:{chatId}");
        if (json.IsNullOrEmpty) return new Session { UserId = chatId };
        return JsonSerializer.Deserialize<Session>(json!) ?? new Session { UserId = chatId };
    }

    public async Task SaveAsync(long chatId, Session session)
    {
        var json = JsonSerializer.Serialize(session);
        await _db.StringSetAsync($"session:{chatId}", json, _expiry);
    }

    public async Task<bool> DeleteAsync(long chatId)
        => await _db.KeyDeleteAsync($"session:{chatId}");
}

// Register in Program.cs (BEFORE AddKippo)
builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect("localhost:6379"));
builder.Services.AddSingleton<ISessionStore, RedisSessionStorage>();`;

export default function Sessions() {
  return (
    <>
      <h1>Session Management</h1>
      <p className="lead">
        Track user state and data across conversations with Kippo's thread-safe sessions,
        with support for custom storage backends.
      </p>

      <Callout type="info" title="Enabling sessions">
        Sessions require <code>SessionMiddleware</code> to be registered.
      </Callout>
      <CodeBlock code={enableSession} language="csharp" filename="Program.cs" />

      <h2>Basic usage</h2>
      <p>Use sessions to create multi-step conversation flows:</p>
      <CodeBlock code={sessionBasics} language="csharp" filename="Session Basics" />

      <h2>Session properties</h2>
      <CodeBlock code={sessionProperties} language="csharp" filename="Session Properties" />

      <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-2 font-semibold text-blue-400">State</h3>
          <p className="text-sm text-zinc-400">
            A string tracking the current conversation state. Pair with{' '}
            <code>[Text(State = "...")]</code> for state-specific handlers.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-2 font-semibold text-green-400">Data</h3>
          <p className="text-sm text-zinc-400">
            A thread-safe <code>ConcurrentDictionary</code> for storing any data across
            messages.
          </p>
        </div>
      </div>

      <h2>Session structure</h2>
      <CodeBlock code={sessionClass} language="csharp" filename="Session.cs" />

      <h2>Custom session storage</h2>
      <p>
        Kippo uses in-memory storage by default. For production, implement{' '}
        <code>ISessionStore</code>:
      </p>
      <CodeBlock code={sessionInterface} language="csharp" filename="ISessionStore" />

      <h3>Redis storage</h3>
      <CodeBlock code={redisSessionStorage} language="csharp" filename="RedisSessionStorage.cs" />

      <h2>Best practices</h2>
      <ul>
        <li>Clear state when a flow completes: <code>context.Session.State = null</code></li>
        <li>Always provide a way to cancel multi-step flows</li>
        <li>Use meaningful state names like <code>"reg_age"</code>, <code>"order_confirm"</code></li>
        <li>Use persistent storage (Redis, database) in production</li>
        <li>Session data stores objects — cast when retrieving: <code>(int)context.Session.Data["age"]</code></li>
      </ul>
    </>
  );
}
