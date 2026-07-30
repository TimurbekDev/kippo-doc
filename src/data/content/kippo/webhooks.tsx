import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';

const program = `var builder = WebApplication.CreateBuilder(args);

// useLongPolling: false → Kippo won't poll; updates arrive over HTTP instead
builder.Services.AddKippo<MyBotHandler>(builder.Configuration, useLongPolling: false)
                .AddKippoMiddleware<SessionMiddleware>();

var app = builder.Build();

// Map the webhook receiver. The secret token (optional) is validated on every request.
app.MapKippoWebhook("/bot", secretToken: "my-secret");

app.Run();`;

const appsettings = `{
  "Kippo": {
    "BotToken": "YOUR_BOT_TOKEN_HERE",

    // Optional: Kippo calls setWebhook for you on startup when WebhookUrl is set.
    "WebhookUrl": "https://bot.example.com/bot",
    "WebhookSecret": "my-secret"
  }
}`;

const configForm = `// With WebhookUrl/WebhookSecret in configuration, the secret is picked up automatically:
app.MapKippoWebhook("/bot");   // secretToken falls back to Kippo:WebhookSecret`;

const manualSetWebhook = `// Prefer to register the webhook yourself? Omit Kippo:WebhookUrl and call it once:
await bot.SetWebhook(
    url: "https://bot.example.com/bot",
    secretToken: "my-secret",
    allowedUpdates: new[] { UpdateType.Message, UpdateType.CallbackQuery });`;

export default function Webhooks() {
  return (
    <>
      <h1>Webhooks</h1>
      <p className="lead">
        Receive updates over HTTP instead of long polling — the right model for production and
        serverless deployments. The webhook endpoint feeds updates through the exact same router,
        middleware and session pipeline as polling, so your handlers don't change.
      </p>

      <Callout type="info" title="Polling vs. webhook">
        <strong>Long polling</strong> (the default) is ideal for development and single-instance
        bots — no public URL required. <strong>Webhooks</strong> suit production: Telegram pushes
        updates to your HTTPS endpoint, scaling across instances and idling at zero cost.
      </Callout>

      <h2>Setup</h2>
      <p>
        Disable polling with <code>useLongPolling: false</code> and map the receiver with{' '}
        <code>MapKippoWebhook</code>:
      </p>
      <CodeBlock code={program} language="csharp" filename="Program.cs" />

      <h2>Registering the webhook with Telegram</h2>
      <p>
        Telegram needs to know your public URL. Set <code>Kippo:WebhookUrl</code> and Kippo calls{' '}
        <code>setWebhook</code> for you on startup:
      </p>
      <CodeBlock code={appsettings} language="json" filename="appsettings.json" />
      <CodeBlock code={configForm} language="csharp" filename="Program.cs" />

      <Callout type="warning" title="HTTPS and a public URL are required">
        Telegram only delivers webhooks to public <code>https://</code> endpoints on ports 443, 80,
        88, or 8443. In local development, expose your app with a tunnel (e.g. ngrok, Cloudflare
        Tunnel) and point <code>WebhookUrl</code> at the tunnel URL.
      </Callout>

      <h2>The secret token</h2>
      <p>
        The optional secret token is echoed by Telegram in the{' '}
        <code>X-Telegram-Bot-Api-Secret-Token</code> header on every request. Kippo rejects any
        request whose header doesn't match with <code>401 Unauthorized</code> — so only Telegram can
        drive your bot. Provide it as the <code>secretToken</code> argument or via{' '}
        <code>Kippo:WebhookSecret</code>.
      </p>

      <h2>Registering manually</h2>
      <p>
        If you'd rather control registration (custom <code>allowedUpdates</code>, dropping pending
        updates, rotating certificates), leave <code>Kippo:WebhookUrl</code> unset and call{' '}
        <code>SetWebhook</code> yourself:
      </p>
      <CodeBlock code={manualSetWebhook} language="csharp" filename="Manual registration" />

      <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-2 font-semibold text-blue-400">Same pipeline</h3>
          <p className="text-sm text-zinc-400">
            Updates flow through your middleware, sessions, routing, scenes and the callback vault
            exactly as they do under polling. No handler changes.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-2 font-semibold text-green-400">Command menu</h3>
          <p className="text-sm text-zinc-400">
            The <code>[Command]</code> descriptions are still registered to Telegram's <code>/</code>{' '}
            menu on startup — webhook mode handles this for you.
          </p>
        </div>
      </div>

      <h2>Best practices</h2>
      <ul>
        <li>Always set a <code>secretToken</code> so only Telegram can post to your endpoint</li>
        <li>Terminate TLS at your host or a reverse proxy — Telegram requires HTTPS</li>
        <li>Use a persistent <code>ISessionStore</code> (Redis, database) when running multiple instances</li>
        <li>Return quickly: heavy work belongs in a background queue, not the webhook request</li>
        <li>For local testing, tunnel your endpoint and set <code>WebhookUrl</code> to the tunnel URL</li>
      </ul>
    </>
  );
}
