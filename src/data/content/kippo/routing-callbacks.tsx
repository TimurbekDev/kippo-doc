import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';

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

const typedTemplate = `// {placeholders} are parsed from the callback data and bound
// to handler parameters by name, with automatic type conversion.
[CallbackQuery("product:{id}:{action}")]
public async Task HandleProduct(Context context, int id, string action)
{
    await context.Callback.Answer();
    // For callback data "product:42:buy" => id = 42, action = "buy"
    await context.Reply($"Product {id} → {action}");
}`;

const typedPagination = `[Command("catalog")]
public async Task ShowCatalog(Context context)
{
    var keyboard = InlineKeyboardBuilder.Create()
        .Button("◀ Prev", "page:1")
        .Button("Next ▶", "page:3")
        .Build();

    await context.Reply("Page 2", keyboard);
}

// One handler for every page — the number is bound as an int
[CallbackQuery("page:{n}")]
public async Task HandlePage(Context context, int n)
{
    await context.Callback.Answer();
    await context.Reply($"Showing page {n}");
}`;

const typedEnumGuid = `public enum OrderStatus { Pending, Shipped, Delivered }

// Enums and Guids convert automatically
[CallbackQuery("order:{orderId}:{status}")]
public async Task HandleOrder(Context context, Guid orderId, OrderStatus status)
{
    await context.Callback.Answer();
    // "order:{guid}:Shipped" => status = OrderStatus.Shipped
    await context.Reply($"Order {orderId} is now {status}");
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
        Handle inline keyboard button clicks with exact, wildcard, or typed template
        pattern matching.
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

      <h2>Typed templates</h2>
      <p>
        Instead of parsing callback data by hand, declare <code>{'{placeholders}'}</code>{' '}
        in the pattern. Each placeholder is captured from the callback data and bound to
        the handler parameter of the same name, with automatic type conversion:
      </p>
      <CodeBlock code={typedTemplate} language="csharp" filename="Typed Template" />

      <Callout type="tip" title="No more string splitting">
        A template replaces the usual <code>Data.Split(':')</code> boilerplate. Parameters
        are matched by name (case-insensitive) and converted to their declared type —
        unmatched or unconvertible values fall back to the parameter default or throw for
        required parameters.
      </Callout>

      <h3>Pagination example</h3>
      <p>A single handler serves every page — the number arrives already typed:</p>
      <CodeBlock code={typedPagination} language="csharp" filename="Pagination" />

      <h3>Enums and Guids</h3>
      <p>Conversion covers more than numbers — enums and Guids work out of the box:</p>
      <CodeBlock code={typedEnumGuid} language="csharp" filename="Enum & Guid" />

      <h4>Supported parameter types</h4>
      <p>
        <code>string</code>, <code>int</code>, <code>long</code>, <code>double</code>,{' '}
        <code>bool</code>, <code>Guid</code>, enums, and their nullable variants. Values
        are parsed with the invariant culture.
      </p>

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
          <tr>
            <td><code>"product:{'{id}'}:{'{action}'}"</code></td>
            <td>Typed template: "product:42:buy" → <code>id=42</code>, <code>action="buy"</code></td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
