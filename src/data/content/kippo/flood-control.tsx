import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';

const enableFloodControl = `// Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddKippo<MyHandler>(
    builder.Configuration,
    configureFloodControl: opt =>
    {
        opt.MaxRetries = 3;                              // retry a 429 up to 3 times
        opt.MaxRetryAfter = TimeSpan.FromSeconds(60);    // but never wait longer than this
        opt.MinIntervalPerChat = TimeSpan.FromSeconds(1); // space out sends per chat
    });

var app = builder.Build();
app.Run();`;

const optionsClass = `public class FloodControlOptions
{
    // Max times a single request is retried after a 429. Default: 3.
    public int MaxRetries { get; set; } = 3;

    // Upper bound on a single retry_after wait. If Telegram asks for longer,
    // the request fails fast instead of blocking. Default: 60s.
    public TimeSpan MaxRetryAfter { get; set; } = TimeSpan.FromSeconds(60);

    // Minimum spacing between two sends to the SAME chat. Zero disables
    // per-chat throttling. Telegram's practical ceiling is ~1 msg/sec/chat.
    public TimeSpan MinIntervalPerChat { get; set; } = TimeSpan.Zero;
}`;

const minimalEnable = `// The simplest form: default retry policy, no per-chat throttle
builder.Services.AddKippo<MyHandler>(
    builder.Configuration,
    configureFloodControl: _ => { });`;

export default function FloodControl() {
  return (
    <>
      <h1>Flood Control</h1>
      <p className="lead">
        Telegram rate-limits bots and answers bursts with <code>429 Too Many Requests</code>. Kippo's
        opt-in flood control transparently retries those requests — honoring the server's{' '}
        <code>retry_after</code> — and can throttle outbound traffic per chat, so you never hand-roll
        backoff again.
      </p>

      <Callout type="info" title="Opt-in">
        Flood control is off by default. Pass <code>configureFloodControl</code> to{' '}
        <code>AddKippo</code> to enable it. When enabled, Kippo wraps the bot client in a{' '}
        <code>ThrottlingBotClient</code> decorator — every outbound call (from handlers or{' '}
        <code>context.Reply</code>) is protected automatically.
      </Callout>

      <h2>Enabling</h2>
      <CodeBlock code={enableFloodControl} language="csharp" filename="Program.cs" />

      <p>All options are optional — enable with defaults by passing an empty configurator:</p>
      <CodeBlock code={minimalEnable} language="csharp" filename="Defaults" />

      <h2>Options</h2>
      <CodeBlock code={optionsClass} language="csharp" filename="FloodControlOptions.cs" />

      <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-2 font-semibold text-blue-400">Retry on 429</h3>
          <p className="text-sm text-zinc-400">
            When Telegram returns <code>429</code>, Kippo waits the requested{' '}
            <code>retry_after</code> and retries, up to <code>MaxRetries</code>. Waits longer than{' '}
            <code>MaxRetryAfter</code> fail fast rather than stalling your bot.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-2 font-semibold text-green-400">Per-chat throttling</h3>
          <p className="text-sm text-zinc-400">
            Set <code>MinIntervalPerChat</code> to serialize and space out sends to the same chat,
            proactively staying under Telegram's ~1 msg/sec/chat ceiling and avoiding{' '}
            <code>429</code>s in the first place.
          </p>
        </div>
      </div>

      <h2>How it works</h2>
      <p>
        <code>ThrottlingBotClient</code> implements <code>ITelegramBotClient</code> and forwards
        every call to the real client, adding retry and throttling around the single request seam that
        all send/edit/answer methods funnel through. Because it's a drop-in decorator, nothing in your
        handlers changes.
      </p>

      <Callout type="warning" title="Retries are for transient limits, not logic errors">
        Only <code>429</code> responses are retried. Other API errors (bad request, blocked by user,
        message not found) surface immediately — flood control never masks real bugs. Idempotency of a
        retried send is Telegram's responsibility; a retried <code>SendMessage</code> after a genuine
        429 is safe because the original never reached the servers.
      </Callout>

      <h2>Best practices</h2>
      <ul>
        <li>Enable it in production — bursty broadcasts and popular bots hit <code>429</code> routinely</li>
        <li>
          Set <code>MinIntervalPerChat</code> to <code>1s</code> for high-traffic chats to avoid limits
          proactively
        </li>
        <li>Keep <code>MaxRetryAfter</code> modest so a long server-side pause doesn't wedge a request</li>
        <li>For fan-out to many chats, throttle at the application level too — Telegram also caps global throughput</li>
      </ul>
    </>
  );
}
