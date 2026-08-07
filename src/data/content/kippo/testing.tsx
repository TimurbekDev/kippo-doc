import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';

const handlerUnderTest = `public class GreetingHandler : BotUpdateHandler
{
    [Command("start", Description = "Start the bot")]
    public Task Start(Context context) => context.Reply("Hello! 👋");

    [Command("register")]
    public async Task Register(Context context)
    {
        context.Session!.SetState("awaiting_name");
        await context.Reply("What's your name?");
    }

    [Text(State = "awaiting_name")]
    public async Task HandleName(Context context)
    {
        context.Session!.Set("name", context.Message.Text);
        context.Session.ClearState();
        await context.Reply($"Nice to meet you, {context.Message.Text}!");
    }
}`;

const basicTest = `using Kippo.Testing;
using Telegram.Bot.Requests;   // SendMessageRequest, AnswerCallbackQueryRequest, ...
using Xunit;

public class GreetingHandlerTests
{
    [Fact]
    public async Task Start_replies_with_greeting()
    {
        var bot = new TestBot<GreetingHandler>();

        await bot.SendCommand("start");

        Assert.Equal("Hello! 👋", bot.LastReply?.Text);
    }

    [Fact]
    public async Task Registration_flow_captures_the_name()
    {
        var bot = new TestBot<GreetingHandler>();

        await bot.SendCommand("register");
        Assert.Equal("awaiting_name", bot.Session.State);

        await bot.SendText("Timur");
        Assert.Null(bot.Session.State);                       // state cleared
        Assert.Equal("Timur", bot.Session.Get<string>("name"));
        Assert.Equal("Nice to meet you, Timur!", bot.LastReply?.Text);
    }
}`;

const sendingUpdates = `var bot = new TestBot<MyHandler>();

await bot.SendText("hello");                 // plain text message
await bot.SendCommand("help");               // "/help"
await bot.SendCommand("echo", "hi there");   // "/echo hi there"
await bot.TapButton("product:42:buy");       // inline button tap (callback query)
await bot.SendContact("+998901234567", "Timur");

// Telegram Business chats
await bot.SendBusinessConnection(isEnabled: true);          // owner connects the bot
await bot.SendBusinessMessage("what is the price?");        // a customer writes
await bot.SendBusinessMessageFromOwner("I'll take over");   // the owner writes
await bot.SendBusinessMessagesDeleted(new[] { 11, 12 });    // messages removed`;

const inspecting = `// The most recent text message the bot sent
SendMessageRequest? reply = bot.LastReply;
Assert.Equal("Done ✅", reply?.Text);

// Every text reply, in order
IReadOnlyList<SendMessageRequest> all = bot.Replies;

// Any other outbound API call — filter by request type
Assert.Contains(bot.Client.SentOf<AnswerCallbackQueryRequest>(), _ => true);
Assert.Single(bot.Client.SentOf<DeleteMessageRequest>());

// Every captured request, in order (SendMessage, EditMessageText, ...)
IReadOnlyList<IRequest> everything = bot.Client.Sent;

// Reset between logical steps of a scenario
bot.Client.Clear();

// Current session for the test chat
Assert.Equal("done", bot.Session.State);`;

const injectingServices = `// Register the services / fakes your handler resolves from DI
var clock = new FakeClock(new DateTime(2026, 1, 1));

var bot = new TestBot<OrderHandler>(services =>
{
    services.AddSingleton<IClock>(clock);
    services.AddSingleton<IOrderRepository, InMemoryOrderRepository>();
});

await bot.SendCommand("order");
Assert.Contains("2026", bot.LastReply?.Text);`;

const differentUsers = `// Simulate updates from a specific chat / user
var admin = new TestBot<AdminHandler>(chatId: 555, userId: 555);
var guest = new TestBot<AdminHandler>(chatId: 999, userId: 999);`;

export default function Testing() {
  return (
    <>
      <h1>Testing</h1>
      <p className="lead">
        Drive your bot with synthetic updates and assert on what it sends — no bot token, no network,
        no Telegram servers. <code>TestBot&lt;T&gt;</code> wires the real router, middleware pipeline
        and session store around a fake client that records every outbound request.
      </p>

      <Callout type="success" title="Ships in the box">
        The harness lives in the <code>Kippo.Testing</code> namespace inside the main{' '}
        <code>Kippo</code> package. Reference it from your test project and you're ready — nothing
        extra to install.
      </Callout>

      <h2>A handler to test</h2>
      <CodeBlock code={handlerUnderTest} language="csharp" filename="GreetingHandler.cs" />

      <h2>Your first test</h2>
      <p>
        Create a <code>TestBot&lt;THandler&gt;</code>, feed it updates, and assert on{' '}
        <code>LastReply</code> and <code>Session</code>. Everything runs in-memory and synchronously.
      </p>
      <CodeBlock code={basicTest} language="csharp" filename="GreetingHandlerTests.cs" />

      <h2>Sending updates</h2>
      <p>Each method builds a real Telegram <code>Update</code> and runs it through your handler:</p>
      <CodeBlock code={sendingUpdates} language="csharp" filename="Sending updates" />

      <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-2 font-semibold text-blue-400">SendText / SendCommand</h3>
          <p className="text-sm text-zinc-400">
            Routes to <code>[Text]</code> and <code>[Command]</code> handlers. State-scoped text
            handlers respect the current <code>Session.State</code>.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-2 font-semibold text-green-400">TapButton</h3>
          <p className="text-sm text-zinc-400">
            Fires a <code>CallbackQuery</code>, routing to <code>[CallbackQuery]</code> handlers —
            including vaulted <code>.Payload(...)</code> buttons, rebound to their typed parameter.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-2 font-semibold text-teal-400">SendBusiness*</h3>
          <p className="text-sm text-zinc-400">
            Plays both sides of a Telegram Business chat. Replies carry the connection id, so{' '}
            <code>bot.LastReply.BusinessConnectionId</code> proves the bot answered as the business
            account.
          </p>
        </div>
      </div>

      <h2>Inspecting what the bot sent</h2>
      <p>
        The fake <code>Client</code> captures every request. <code>LastReply</code> and{' '}
        <code>Replies</code> are shortcuts for text messages; <code>SentOf&lt;T&gt;()</code> filters
        by any request DTO from <code>Telegram.Bot.Requests</code>.
      </p>
      <CodeBlock code={inspecting} language="csharp" filename="Inspecting output" />

      <h2>Injecting services</h2>
      <p>
        Register whatever your handler pulls from DI — repositories, clocks, HTTP clients — through
        the constructor callback. This is the seam for fakes and in-memory doubles.
      </p>
      <CodeBlock code={injectingServices} language="csharp" filename="DI in tests" />

      <h2>Multiple chats and users</h2>
      <p>
        By default updates originate from chat/user <code>1000</code>. Override to test
        per-user behavior or authorization:
      </p>
      <CodeBlock code={differentUsers} language="csharp" filename="Chats and users" />

      <Callout type="tip" title="What runs, what doesn't">
        <code>TestBot</code> exercises the <em>real</em> routing, middleware and session logic — the
        only fake is the network client. It does not call Telegram's <code>SetMyCommands</code> on
        startup and does not long-poll, so tests stay fast and deterministic. If a handler throws, the
        exception surfaces in your test instead of being swallowed.
      </Callout>

      <h2>Best practices</h2>
      <ul>
        <li>One <code>TestBot</code> per test for isolation — sessions and captured calls reset with it</li>
        <li>Assert on <code>Session.State</code> to verify multi-step flows transition correctly</li>
        <li>Use <code>Client.Clear()</code> to separate arrange/act phases in longer scenarios</li>
        <li>Filter with <code>SentOf&lt;T&gt;()</code> to assert on edits, deletes, and callback answers</li>
      </ul>
    </>
  );
}
