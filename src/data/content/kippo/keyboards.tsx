import { CodeBlock } from '../../../components/docs/CodeBlock';

const replyKeyboardBasic = `var keyboard = ReplyKeyboardBuilder.Create()
    .Button("Option 1")
    .Button("Option 2")
    .Row()  // Start new row
    .Button("Option 3")
    .Button("Option 4")
    .Resize()   // Auto-resize to fit content
    .OneTime()  // Hide after button press
    .Build();

await context.Reply("Choose an option:", keyboard);`;

const replyKeyboardAdvanced = `var keyboard = ReplyKeyboardBuilder.Create()
    .Button("📝 Create")
    .Button("📋 List")
    .Row()
    .Button("⚙️ Settings")
    .Button("❌ Cancel")
    .Row()
    .LocationButton("📍 Share Location")
    .ContactButton("📱 Share Contact")
    .Resize()
    .Placeholder("Select an action...")
    .Build();

await context.Reply("Main Menu:", keyboard);`;

const removeKeyboard = `// Remove the reply keyboard
await context.Reply("Keyboard removed", new ReplyKeyboardRemove());`;

const inlineKeyboardBasic = `var keyboard = InlineKeyboardBuilder.Create()
    .Button("✅ Yes", "answer_yes")
    .Button("❌ No", "answer_no")
    .Row()
    .Button("📊 View Stats", "stats")
    .Build();

await context.Reply("Do you agree?", keyboard);`;

const inlineKeyboardAdvanced = `var keyboard = InlineKeyboardBuilder.Create()
    .Button("🏠 Home", "nav_home")
    .Button("⚙️ Settings", "nav_settings")
    .Row()
    .UrlButton("📖 Documentation", "https://docs.example.com")
    .Row()
    .Button("⬅️ Prev", "page_prev")
    .Button("1 / 10", "page_info")
    .Button("➡️ Next", "page_next")
    .Build();

await context.Reply("Navigation Menu:", keyboard);`;

const dynamicKeyboard = `[Command("products")]
public async Task ShowProducts(Context context)
{
    var products = new[] { "Apple", "Banana", "Orange", "Mango" };
    var builder = InlineKeyboardBuilder.Create();

    for (int i = 0; i < products.Length; i++)
    {
        builder.Button(products[i], $"buy_{products[i].ToLower()}");

        // Add row after every 2 buttons
        if ((i + 1) % 2 == 0 && i < products.Length - 1)
            builder.Row();
    }

    await context.Reply("Available products:", builder.Build());
}`;

const paginationExample = `public async Task ShowPage(Context context, int page, int totalPages)
{
    var keyboard = InlineKeyboardBuilder.Create();

    if (page > 1)
        keyboard.Button("⬅️ Previous", $"page_{page - 1}");

    keyboard.Button($"{page} / {totalPages}", "page_current");

    if (page < totalPages)
        keyboard.Button("Next ➡️", $"page_{page + 1}");

    await context.Reply($"Page {page} content here", keyboard.Build());
}

[CallbackQuery("page_*")]
public async Task HandlePagination(Context context)
{
    var pageStr = context.Callback.Data.Replace("page_", "");
    if (int.TryParse(pageStr, out var page))
    {
        await context.Callback.Answer();
        await ShowPage(context, page, 10);
    }
}`;

export default function Keyboards() {
  return (
    <>
      <h1>Keyboards</h1>
      <p className="lead">
        Create interactive reply and inline keyboards with Kippo's fluent builder API.
      </p>

      <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <h3 className="mb-2 font-semibold text-blue-400">Reply keyboard</h3>
          <p className="text-sm text-zinc-400">
            Appears at the bottom of the chat. Text buttons that send messages; can request
            location or contact; persistent or one-time.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <h3 className="mb-2 font-semibold text-purple-400">Inline keyboard</h3>
          <p className="text-sm text-zinc-400">
            Attached to a message. Callback buttons with data and URL buttons; stays with
            the message.
          </p>
        </div>
      </div>

      <h2>Reply keyboard</h2>
      <CodeBlock code={replyKeyboardBasic} language="csharp" filename="Basic Reply Keyboard" />

      <h3>Advanced options</h3>
      <CodeBlock code={replyKeyboardAdvanced} language="csharp" filename="Advanced Reply Keyboard" />

      <table>
        <thead>
          <tr><th>Method</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>Button(text)</code></td><td>Add a text button</td></tr>
          <tr><td><code>LocationButton(text)</code></td><td>Request the user's location</td></tr>
          <tr><td><code>ContactButton(text)</code></td><td>Request the user's contact</td></tr>
          <tr><td><code>Row()</code></td><td>Start a new row of buttons</td></tr>
          <tr><td><code>Resize()</code></td><td>Auto-resize keyboard to fit content</td></tr>
          <tr><td><code>OneTime()</code></td><td>Hide keyboard after button press</td></tr>
          <tr><td><code>Placeholder(text)</code></td><td>Set input field placeholder</td></tr>
        </tbody>
      </table>

      <h3>Remove keyboard</h3>
      <CodeBlock code={removeKeyboard} language="csharp" filename="Remove Keyboard" />

      <h2>Inline keyboard</h2>
      <CodeBlock code={inlineKeyboardBasic} language="csharp" filename="Basic Inline Keyboard" />

      <h3>Advanced layout</h3>
      <CodeBlock code={inlineKeyboardAdvanced} language="csharp" filename="Advanced Inline Keyboard" />

      <table>
        <thead>
          <tr><th>Method</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>Button(text, callbackData)</code></td><td>Add a callback button</td></tr>
          <tr><td><code>UrlButton(text, url)</code></td><td>Add a URL button</td></tr>
          <tr><td><code>Row()</code></td><td>Start a new row of buttons</td></tr>
        </tbody>
      </table>

      <h2>Dynamic keyboards</h2>
      <p>Build keyboards dynamically from data:</p>
      <CodeBlock code={dynamicKeyboard} language="csharp" filename="Dynamic Keyboard" />

      <h2>Pagination example</h2>
      <p>Implement pagination with inline keyboards:</p>
      <CodeBlock code={paginationExample} language="csharp" filename="Pagination" />
    </>
  );
}
