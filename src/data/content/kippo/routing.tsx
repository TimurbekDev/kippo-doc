import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';

const commandExample = `[Command("start")]
public async Task Start(Context context)
{
    await context.Reply("Welcome!");
}

[Command("settings", Description = "Bot settings")]
public async Task Settings(Context context)
{
    await context.Reply("Settings menu");
}`;

const textExample = `// Handle all text messages (lowest priority)
[Text]
public async Task HandleAnyText(Context context)
{
    await context.Reply($"You said: {context.Message.Text}");
}

// Match exact text
[Text(Pattern = "Hello")]
public async Task SayHello(Context context)
{
    await context.Reply("Hi there!");
}

// Match with regex
[Text(Regex = @"^\\d+$")]
public async Task HandleNumbers(Context context)
{
    await context.Reply("That's a number!");
}

// State-specific handler (highest priority)
[Text(State = "awaiting_name")]
public async Task HandleName(Context context)
{
    context.Session!.Data["name"] = context.Message.Text;
    await context.Reply("Name saved!");
}`;

const callbackExample = `// Exact match
[CallbackQuery("confirm")]
public async Task HandleConfirm(Context context)
{
    await context.Callback.Answer("Confirmed!");
    await context.Reply("Action confirmed");
}

// Prefix match with wildcard (*)
[CallbackQuery("page_*")]
public async Task HandlePage(Context context)
{
    var page = context.Callback.Data.Replace("page_", "");
    await context.Callback.Answer();
    await context.Reply($"Showing page {page}");
}`;

const multipleAttributesExample = `// Handler responds to multiple triggers
[Command("cancel")]
[Text(Pattern = "Cancel")]
[Text(Pattern = "❌ Cancel")]
public async Task Cancel(Context context)
{
    context.Session!.State = null;
    await context.Reply("Operation cancelled");
}`;

export default function Routing() {
  return (
    <>
      <h1>Routing</h1>
      <p className="lead">
        Kippo routes Telegram updates to your handler methods using attributes — no
        complex configuration, just decorate your methods.
      </p>

      <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <h3 className="mb-1 font-mono font-semibold text-blue-400">[Command]</h3>
          <p className="text-sm text-zinc-400">Handle bot commands starting with /</p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <h3 className="mb-1 font-mono font-semibold text-green-400">[Text]</h3>
          <p className="text-sm text-zinc-400">Handle text messages with pattern matching</p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <h3 className="mb-1 font-mono font-semibold text-purple-400">[CallbackQuery]</h3>
          <p className="text-sm text-zinc-400">Handle inline keyboard button clicks</p>
        </div>
      </div>

      <h2>[Command] Attribute</h2>
      <p>
        Handle bot commands — messages starting with <code>/</code>:
      </p>
      <CodeBlock code={commandExample} language="csharp" filename="Commands" />

      <h2>[Text] Attribute</h2>
      <p>Handle text messages with flexible pattern matching:</p>
      <CodeBlock code={textExample} language="csharp" filename="Text Handlers" />

      <Callout type="info" title="Priority order">
        Text handlers are matched most-specific first: state + pattern, then state only,
        then pattern/contains/regex, and finally a bare <code>[Text]</code> catch-all.
      </Callout>

      <h2>[CallbackQuery] Attribute</h2>
      <p>Handle inline keyboard button presses, with exact or wildcard matching:</p>
      <CodeBlock code={callbackExample} language="csharp" filename="Callback Handlers" />

      <h2>Multiple Attributes</h2>
      <p>A single handler can respond to multiple triggers:</p>
      <CodeBlock code={multipleAttributesExample} language="csharp" filename="Multiple Triggers" />
    </>
  );
}
