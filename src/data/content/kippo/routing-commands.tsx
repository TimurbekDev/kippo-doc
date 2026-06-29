import { CodeBlock } from '../../../components/docs/CodeBlock';

const basicCommand = `[Command("start")]
public async Task Start(Context context)
{
    await context.Reply("Welcome!");
}`;

const commandWithDescription = `[Command("settings", Description = "Bot settings")]
public async Task Settings(Context context)
{
    await context.Reply("Settings menu");
}`;

const multipleCommands = `[Command("help")]
[Command("info")]
public async Task HelpOrInfo(Context context)
{
    await context.Reply("Help information");
}`;

const commandWithArgs = `[Command("echo")]
public async Task Echo(Context context)
{
    // Get text after the command
    var text = context.Message.Text;
    var args = text?.Split(' ').Skip(1).ToArray() ?? Array.Empty<string>();

    if (args.Length > 0)
        await context.Reply($"You said: {string.Join(" ", args)}");
    else
        await context.Reply("Usage: /echo <text>");
}`;

export default function RoutingCommands() {
  return (
    <>
      <h1>[Command] Attribute</h1>
      <p className="lead">
        Handle bot commands — messages starting with <code>/</code>.
      </p>

      <h2>Basic usage</h2>
      <CodeBlock code={basicCommand} language="csharp" filename="Basic Command" />

      <h2>With description</h2>
      <p>Add a description for documentation purposes:</p>
      <CodeBlock code={commandWithDescription} language="csharp" filename="Command with Description" />

      <h2>Multiple commands</h2>
      <p>One handler can respond to multiple commands:</p>
      <CodeBlock code={multipleCommands} language="csharp" filename="Multiple Commands" />

      <h2>Command arguments</h2>
      <p>Parse arguments from the command text:</p>
      <CodeBlock code={commandWithArgs} language="csharp" filename="Command with Arguments" />

      <h2>Properties</h2>
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>command</code></td>
            <td>string</td>
            <td>Command name without the / prefix</td>
          </tr>
          <tr>
            <td><code>Description</code></td>
            <td>string?</td>
            <td>Optional description</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
