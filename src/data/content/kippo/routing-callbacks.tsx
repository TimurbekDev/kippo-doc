import { CodeBlock } from '../../../components/docs/CodeBlock';

const exactMatch = `[CallbackQuery("confirm")]
public async Task HandleConfirm(Context context)
{
    await context.Callback.Answer("Confirmed!");
    await context.Reply("Action confirmed");
}`;

const prefixMatch = `[CallbackQuery("page_*")]
public async Task HandlePage(Context context)
{
    var page = context.Callback.Data.Replace("page_", "");
    await context.Callback.Answer();
    await context.Reply($"Showing page {page}");
}`;

const wildcardMatch = `[CallbackQuery("*")]
public async Task HandleAnyCallback(Context context)
{
    await context.Callback.Answer();
}`;

const answerOptions = `[CallbackQuery("action_*")]
public async Task HandleAction(Context context)
{
    // Simple answer (removes loading indicator)
    await context.Callback.Answer();

    // Answer with notification
    await context.Callback.Answer("Action completed!");

    // Answer with alert popup
    await context.Callback.Answer("Important!", showAlert: true);

    // Answer with URL
    await context.Callback.Answer(url: "https://example.com");
}`;

const createKeyboard = `[Command("menu")]
public async Task ShowMenu(Context context)
{
    var keyboard = InlineKeyboardBuilder.Create()
        .Button("Option A", "select_a")
        .Button("Option B", "select_b")
        .Row()
        .Button("Cancel", "cancel")
        .Build();

    await context.Reply("Choose an option:", keyboard);
}

[CallbackQuery("select_*")]
public async Task HandleSelect(Context context)
{
    var option = context.Callback.Data.Replace("select_", "");
    await context.Callback.Answer($"Selected: {option}");
    await context.Reply($"You selected option {option.ToUpper()}");
}`;

export default function RoutingCallbacks() {
  return (
    <>
      <h1>[CallbackQuery] Attribute</h1>
      <p className="lead">
        Handle inline keyboard button clicks with exact or wildcard pattern matching.
      </p>

      <h2>Exact match</h2>
      <CodeBlock code={exactMatch} language="csharp" filename="Exact Match" />

      <h2>Prefix match (wildcard)</h2>
      <p>
        Use <code>*</code> at the end to match prefixes:
      </p>
      <CodeBlock code={prefixMatch} language="csharp" filename="Prefix Match" />

      <h2>Match any callback</h2>
      <CodeBlock code={wildcardMatch} language="csharp" filename="Wildcard" />

      <h2>Answer options</h2>
      <p>Different ways to answer a callback query:</p>
      <CodeBlock code={answerOptions} language="csharp" filename="Answer Options" />

      <h2>Complete example</h2>
      <p>Creating a keyboard and handling its callbacks:</p>
      <CodeBlock code={createKeyboard} language="csharp" filename="Complete Example" />

      <h2>Pattern matching</h2>
      <table>
        <thead>
          <tr>
            <th>Pattern</th>
            <th>Matches</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>"confirm"</code></td>
            <td>Exact: "confirm"</td>
          </tr>
          <tr>
            <td><code>"page_*"</code></td>
            <td>Prefix: "page_1", "page_next"</td>
          </tr>
          <tr>
            <td><code>"*"</code></td>
            <td>Any callback data</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
