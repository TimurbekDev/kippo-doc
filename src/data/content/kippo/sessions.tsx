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
    context.Session!.SetState("awaiting_name");
    context.Session.Set("started_at", DateTime.Now);
    await context.Reply("What's your name?");
}

[Text(State = "awaiting_name")]
public async Task HandleName(Context context)
{
    context.Session!.Set("name", context.Message.Text);
    context.Session.SetState("awaiting_age");
    await context.Reply($"Nice to meet you! How old are you?");
}

[Text(State = "awaiting_age")]
public async Task HandleAge(Context context)
{
    if (int.TryParse(context.Message.Text, out var age))
    {
        context.Session!.Set("age", age);
        context.Session.ClearState(); // Registration complete
        await context.Reply($"Registration complete! Age: {age}");
    }
    else
    {
        await context.Reply("Please enter a valid number");
    }
}`;

const stateEnum = `// Define your flow as an enum for type-safe states
enum Registration { AwaitingName, AwaitingAge }

[Command("register")]
public async Task Register(Context context)
{
    context.Session!.SetState(Registration.AwaitingName);
    await context.Reply("What's your name?");
}

[Text(State = nameof(Registration.AwaitingName))]
public async Task Name(Context context)
{
    if (context.Session!.InState(Registration.AwaitingName))
    {
        context.Session.Set("name", context.Message.Text);
        context.Session.SetState(Registration.AwaitingAge);
        await context.Reply("How old are you?");
    }
}

// Read the typed state back
var state = context.Session!.GetState<Registration>();`;

const sessionProperties = `// State - track conversation flow (helpers keep it type-safe)
context.Session!.SetState("awaiting_input");
var currentState = context.Session.State;
bool waiting = context.Session.InState("awaiting_input");
context.Session.ClearState();               // same as SetState(null)

// Data - typed get/set extensions
context.Session.Set("user_id", 12345);      // marks the session dirty
var id = context.Session.Get<int>("user_id");
context.Session.Remove("user_id");

// Direct dictionary access still works
context.Session.Data["key"] = value;
var country = context.Session.Data.GetValueOrDefault("country", "Unknown");`;

const sessionClass = `public class Session
{
    public long UserId { get; set; }
    public string? State { get; set; }
    public ConcurrentDictionary<string, object> Data { get; set; } = new();

    // State helpers
    public void SetState(string? state);
    public void ClearState();
    public bool InState(string state);

    // Enum-typed overloads (stored as the enum name)
    public void SetState<TEnum>(TEnum state) where TEnum : struct, Enum;
    public TEnum? GetState<TEnum>() where TEnum : struct, Enum;
    public bool InState<TEnum>(TEnum state) where TEnum : struct, Enum;
}`;

const sessionOptions = `builder.Services.AddKippo<MyHandler>(builder.Configuration, options =>
{
    // Sliding expiration — sessions idle longer than this are evicted
    options.Ttl = TimeSpan.FromHours(2);

    // Hard cap — least-recently-used sessions evicted over the limit
    options.MaxSessions = 10_000;

    // How often the background sweep purges expired sessions (default 5 min)
    options.SweepInterval = TimeSpan.FromMinutes(5);
});`;

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

      <Callout type="tip" title="New in 1.1.0">
        The <code>SetState</code> / <code>ClearState</code> / <code>InState</code> helpers and
        the typed <code>Set</code>/<code>Get</code>/<code>Remove</code> extensions replace raw{' '}
        <code>Data[...]</code> and <code>State = ...</code> assignments. They also mark the session
        <em> dirty</em> so it is only persisted when it actually changed.
      </Callout>

      <h2>Session properties</h2>
      <CodeBlock code={sessionProperties} language="csharp" filename="Session Properties" />

      <h2>Type-safe states with enums</h2>
      <p>
        Prefer an <code>enum</code> over magic strings for conversation states. The enum overloads
        store the state as its name, so <code>[Text(State = nameof(...))]</code> matches cleanly.
      </p>
      <CodeBlock code={stateEnum} language="csharp" filename="Enum States" />

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

      <h2>Persistence &amp; dirty tracking</h2>
      <p>
        <code>SessionMiddleware</code> loads the session before your handler and saves it after.
        Since 1.1.0 it only calls <code>SaveAsync</code> when the session was mutated through{' '}
        <code>SetState</code>, <code>Set</code>, or <code>Remove</code>, avoiding redundant writes
        to external stores. It also serializes concurrent updates for the same chat with striped
        locks, preventing lost updates when a user fires messages in parallel.
      </p>
      <Callout type="warning" title="Direct dictionary writes bypass dirty tracking">
        Mutating <code>Session.Data[...]</code> directly does <strong>not</strong> mark the session
        dirty. Use <code>context.Session.Set(key, value)</code> so the change is persisted.
      </Callout>

      <h2>Automatic eviction</h2>
      <p>
        The in-memory store grows unbounded by default. For long-running bots, configure a sliding
        TTL and/or a max-session cap through <code>AddKippo</code>:
      </p>
      <CodeBlock code={sessionOptions} language="csharp" filename="Program.cs" />

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
        <li>Clear state when a flow completes: <code>context.Session.ClearState()</code></li>
        <li>Prefer <code>enum</code> states over magic strings for compile-time safety</li>
        <li>Mutate through <code>Set</code>/<code>SetState</code>/<code>Remove</code> so changes are persisted</li>
        <li>Always provide a way to cancel multi-step flows</li>
        <li>Configure <code>Ttl</code>/<code>MaxSessions</code> for long-running in-memory bots</li>
        <li>Use persistent storage (Redis, database) in production</li>
        <li>Retrieve typed data with <code>context.Session.Get&lt;int&gt;("age")</code></li>
      </ul>
    </>
  );
}
