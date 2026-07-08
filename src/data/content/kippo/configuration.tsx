import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';
import { useDocs } from '../../../context/DocsProvider';

const basicConfig = `{
  "Kippo": {
    "BotToken": "YOUR_BOT_TOKEN_HERE"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}`;

const envVariables = `# Windows (PowerShell)
$env:Kippo__BotToken = "YOUR_BOT_TOKEN"

# Linux/macOS
export Kippo__BotToken="YOUR_BOT_TOKEN"

# Docker
docker run -e Kippo__BotToken="YOUR_BOT_TOKEN" mybot`;

const secretsManager = `# Initialize user secrets (development only)
dotnet user-secrets init

# Set the bot token
dotnet user-secrets set "Kippo:BotToken" "YOUR_BOT_TOKEN"

# List secrets
dotnet user-secrets list`;

const programCs = `using Kippo.Extensions;
using Kippo.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Configuration is automatically loaded from:
// 1. appsettings.json
// 2. appsettings.{Environment}.json
// 3. Environment variables
// 4. User secrets (Development only)

builder.Services.AddKippo<MyHandler>(builder.Configuration)
                .AddKippoMiddleware<SessionMiddleware>();

var app = builder.Build();
app.Run();`;

const optionsPattern = `// Create a settings class
public class BotSettings
{
    public const string SectionName = "Bot";

    public long[] AdminUsers { get; set; } = Array.Empty<long>();
    public int RateLimitSeconds { get; set; } = 2;
    public string WelcomeMessage { get; set; } = "Welcome!";
}

// Register in Program.cs
builder.Services.Configure<BotSettings>(
    builder.Configuration.GetSection(BotSettings.SectionName));

// Use in handler via IOptions<T>
[Command("start")]
public async Task Start(Context context, IOptions<BotSettings> options)
{
    await context.Reply(options.Value.WelcomeMessage);
}`;

const sessionOptions = `builder.Services.AddKippo<MyHandler>(builder.Configuration, options =>
{
    options.Ttl = TimeSpan.FromHours(2);   // evict idle sessions
    options.MaxSessions = 10_000;          // LRU cap
    options.SweepInterval = TimeSpan.FromMinutes(5);
});`;

const loggingConfig = `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Kippo": "Debug",
      "MyApp": "Debug"
    }
  }
}`;

const projectStructure = `MyTelegramBot/
├── Program.cs
├── MyHandler.cs
├── appsettings.json              # Base configuration
├── appsettings.Development.json  # Development overrides
├── appsettings.Production.json   # Production overrides
└── MyTelegramBot.csproj`;

export default function Configuration() {
  const { hrefFor } = useDocs();
  return (
    <>
      <h1>Configuration</h1>
      <p className="lead">
        Configure your Kippo bot with ASP.NET Core's configuration system — JSON files,
        environment variables, and user secrets.
      </p>

      <h2>Basic configuration</h2>
      <p>The minimum required configuration is your bot token in <code>appsettings.json</code>:</p>
      <CodeBlock code={basicConfig} language="json" filename="appsettings.json" />

      <h2>Project structure</h2>
      <CodeBlock code={projectStructure} language="plaintext" />

      <h2>Secure token storage</h2>
      <Callout type="warning" title="Security warning">
        Never commit your bot token to version control. Use environment variables or user
        secrets for sensitive data.
      </Callout>

      <h3>Environment variables</h3>
      <p>Set the token via environment variable (recommended for production):</p>
      <CodeBlock code={envVariables} language="bash" filename="Environment Variables" />

      <h3>User secrets (development)</h3>
      <CodeBlock code={secretsManager} language="bash" filename="User Secrets" />

      <h2>Loading configuration</h2>
      <CodeBlock code={programCs} language="csharp" filename="Program.cs" />

      <Callout type="info" title="Configuration priority (highest to lowest)">
        <ol>
          <li>Command-line arguments</li>
          <li>Environment variables</li>
          <li>User secrets (Development only)</li>
          <li>appsettings.&#123;Environment&#125;.json</li>
          <li>appsettings.json</li>
        </ol>
      </Callout>

      <h2>Session options</h2>
      <p>
        Configure in-memory session eviction (added in 1.1.0) with the <code>AddKippo</code>{' '}
        options delegate — see <Link to={hrefFor('sessions')}>Sessions</Link> for details.
      </p>
      <CodeBlock code={sessionOptions} language="csharp" filename="Program.cs" />

      <h2>Options pattern</h2>
      <p>Use the Options pattern for strongly-typed configuration:</p>
      <CodeBlock code={optionsPattern} language="csharp" filename="Options Pattern" />

      <h2>Logging configuration</h2>
      <CodeBlock code={loggingConfig} language="json" filename="Logging Configuration" />

      <table>
        <thead>
          <tr><th>Level</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>Trace</code></td><td>Most detailed logs</td></tr>
          <tr><td><code>Debug</code></td><td>Debugging information</td></tr>
          <tr><td><code>Information</code></td><td>General flow information</td></tr>
          <tr><td><code>Warning</code></td><td>Abnormal or unexpected events</td></tr>
          <tr><td><code>Error</code></td><td>Errors and exceptions</td></tr>
          <tr><td><code>Critical</code></td><td>Failures requiring immediate attention</td></tr>
        </tbody>
      </table>
    </>
  );
}
