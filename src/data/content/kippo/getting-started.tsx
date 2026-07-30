import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';
import { Steps, Step } from '../../../components/docs/Steps';
import { useDocs } from '../../../context/DocsProvider';

const createProjectCode = (id: string) => `# Create a new ASP.NET Core project
dotnet new web -n MyTelegramBot
cd MyTelegramBot

# Add the Kippo package
dotnet add package ${id}`;

const appsettings = `{
  "Kippo": {
    "BotToken": "YOUR_BOT_TOKEN_HERE"
  },
  "Logging": {
    "LogLevel": { "Default": "Information" }
  }
}`;

const handlerCode = `public class MyBotHandler : BotUpdateHandler
{
    [Command("start")]
    public async Task Start(Context context)
    {
        var keyboard = ReplyKeyboardBuilder.Create()
            .Button("Say Hello")
            .Button("Help")
            .Resize()
            .Build();

        await context.Reply("Welcome to my bot! Choose an option:", keyboard);
    }

    [Text(Pattern = "Say Hello")]
    public async Task SayHello(Context context)
    {
        var name = context.Update.Message?.From?.FirstName ?? "friend";
        await context.Reply($"Hello, {name}!");
    }

    [Text]
    public async Task HandleText(Context context)
        => await context.Reply($"You said: {context.Message.Text}");
}`;

const programCode = `var builder = WebApplication.CreateBuilder(args);

builder.Services.AddKippo<MyBotHandler>(builder.Configuration)
                .AddKippoMiddleware<SessionMiddleware>();

var app = builder.Build();
app.Run();`;

export default function GettingStarted() {
  const { pkg } = useDocs();
  return (
    <>
      <h1>Getting Started</h1>
      <p className="lead">
        Get your Telegram bot running in under five minutes with this step-by-step guide.
      </p>

      <Callout type="info" title="Prerequisites">
        <ul>
          <li>.NET 8.0, 9.0, or 10.0 SDK installed</li>
          <li>
            A Telegram bot token from{' '}
            <a href="https://t.me/botfather" target="_blank" rel="noopener noreferrer">
              @BotFather
            </a>
          </li>
          <li>Basic knowledge of C# and ASP.NET Core</li>
        </ul>
      </Callout>

      <Steps>
        <Step n={1} title="Create a new project">
          <p>Create an ASP.NET Core project and add the package:</p>
          <CodeBlock code={createProjectCode(pkg.nugetId)} language="bash" filename="Terminal" />
        </Step>

        <Step n={2} title="Configure your bot token">
          <p>
            Add your bot token to <code>appsettings.json</code>:
          </p>
          <CodeBlock code={appsettings} language="json" filename="appsettings.json" />
          <Callout type="warning" title="Keep it secret">
            Never commit your bot token. Use <code>appsettings.Development.json</code> or user
            secrets locally.
          </Callout>
        </Step>

        <Step n={3} title="Create your bot handler">
          <p>
            Create <code>MyBotHandler.cs</code> with your bot logic:
          </p>
          <CodeBlock code={handlerCode} language="csharp" filename="MyBotHandler.cs" />
          <Callout type="info" title="No using directives needed">
            Kippo's whole API lives in one <code>Kippo</code> namespace, and the package registers{' '}
            <code>global using Kippo;</code> (plus the <code>Telegram.Bot</code> namespaces) in any
            project with <code>ImplicitUsings</code> enabled — which <code>dotnet new web</code> sets
            by default. Opt out with{' '}
            <code>&lt;KippoImplicitUsings&gt;false&lt;/KippoImplicitUsings&gt;</code> and add{' '}
            <code>using Kippo;</code> yourself.
          </Callout>
        </Step>

        <Step n={4} title="Register Kippo in Program.cs">
          <CodeBlock code={programCode} language="csharp" filename="Program.cs" />
        </Step>

        <Step n={5} title="Run your bot">
          <CodeBlock code="dotnet run" language="bash" filename="Terminal" />
          <Callout type="success" title="Your bot is live!">
            Open Telegram and send <code>/start</code> to your bot to test it.
          </Callout>
        </Step>
      </Steps>
    </>
  );
}
