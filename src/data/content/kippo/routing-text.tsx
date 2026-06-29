import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';

const basicText = `[Text]
public async Task HandleAnyText(Context context)
{
    await context.Reply($"You said: {context.Message.Text}");
}`;

const patternMatch = `[Text(Pattern = "Hello")]
public async Task SayHello(Context context)
{
    await context.Reply("Hi there!");
}`;

const containsMatch = `[Text(Contains = "help")]
public async Task ShowHelp(Context context)
{
    await context.Reply("Need help? Ask me anything!");
}`;

const regexMatch = `[Text(Regex = @"^\\d+$")]
public async Task HandleNumbers(Context context)
{
    await context.Reply("That's a number!");
}`;

const stateMatch = `[Text(State = "awaiting_name")]
public async Task HandleName(Context context)
{
    context.Session!.Data["name"] = context.Message.Text;
    context.Session.State = null;
    await context.Reply("Name saved!");
}`;

const combinedMatch = `[Text(State = "awaiting_age", Regex = @"^\\d+$")]
public async Task HandleAge(Context context)
{
    var age = int.Parse(context.Message.Text!);
    context.Session!.Data["age"] = age;
    context.Session.State = null;
    await context.Reply($"Age {age} saved!");
}`;

export default function RoutingText() {
  return (
    <>
      <h1>[Text] Attribute</h1>
      <p className="lead">
        Handle text messages with flexible pattern matching and state-based routing.
      </p>

      <h2>Catch all text</h2>
      <p>Handle any text message (lowest priority):</p>
      <CodeBlock code={basicText} language="csharp" filename="Catch All" />

      <h2>Exact pattern match</h2>
      <p>Match exact text, case-insensitive:</p>
      <CodeBlock code={patternMatch} language="csharp" filename="Pattern Match" />

      <h2>Contains match</h2>
      <p>Match text containing a substring:</p>
      <CodeBlock code={containsMatch} language="csharp" filename="Contains Match" />

      <h2>Regex match</h2>
      <p>Match text using regular expressions:</p>
      <CodeBlock code={regexMatch} language="csharp" filename="Regex Match" />

      <h2>State-based routing</h2>
      <p>Handle text only when the session is in a specific state:</p>
      <CodeBlock code={stateMatch} language="csharp" filename="State Match" />

      <h2>Combined conditions</h2>
      <p>Combine state with pattern matching:</p>
      <CodeBlock code={combinedMatch} language="csharp" filename="Combined" />

      <Callout type="info" title="Priority order">
        <ol>
          <li><strong>State + Pattern/Contains/Regex</strong> — highest priority</li>
          <li><strong>State only</strong> — second priority</li>
          <li><strong>Pattern/Contains/Regex only</strong> — third priority</li>
          <li><strong>No conditions [Text]</strong> — lowest priority (catch-all)</li>
        </ol>
      </Callout>
    </>
  );
}
