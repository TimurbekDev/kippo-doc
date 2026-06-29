import { CodeBlock } from '../../../components/docs/CodeBlock';

const contextOverview = `public async Task MyHandler(Context context)
{
    // Bot client - access to Telegram Bot API
    var bot = context.BotClient;
    var me = await bot.GetMeAsync();

    // Update information
    var update = context.Update;
    var updateType = update.Type;

    // Message data
    var message = context.Message;
    var text = context.Message.Text;
    var chatId = context.ChatId;

    // User information
    var user = context.Update.Message?.From;
    var userId = user?.Id;

    // Session management
    context.Session!.State = "processing";
    context.Session.Data["key"] = "value";

    // Send messages
    await context.Reply("Simple text");

    // Callback queries
    await context.Callback.Answer();
    var data = context.Callback.Data;
}`;

const replyExamples = `// Simple text reply
await context.Reply("Hello, World!");

// Reply with keyboard
var keyboard = ReplyKeyboardBuilder.Create()
    .Button("Option 1")
    .Button("Option 2")
    .Build();

await context.Reply("Choose an option:", keyboard);

// Reply with inline keyboard
var inlineKeyboard = InlineKeyboardBuilder.Create()
    .Button("Click me", "button_clicked")
    .Build();

await context.Reply("Click the button:", inlineKeyboard);

// Reply with parse mode
await context.Reply("*Bold* and _italic_ text", parseMode: ParseMode.Markdown);`;

const callbackContextExample = `[CallbackQuery("action_*")]
public async Task HandleAction(Context context)
{
    // Get callback data
    var data = context.Callback.Data; // e.g., "action_confirm"

    // Answer callback (removes loading indicator)
    await context.Callback.Answer();

    // Answer with notification
    await context.Callback.Answer("Action completed!");

    // Answer with alert popup
    await context.Callback.Answer("Important message!", showAlert: true);

    // Answer with URL (opens link)
    await context.Callback.Answer(url: "https://example.com");
}`;

const sessionExample = `[Command("start")]
public async Task Start(Context context)
{
    // Set session state
    context.Session!.State = "awaiting_input";

    // Store data in session
    context.Session.Data["user_name"] = "John";
    context.Session.Data["counter"] = 0;

    // Retrieve data
    var name = context.Session.Data["user_name"];

    // Clear session
    context.Session.State = null;
    context.Session.Data.Clear();
}`;

const advancedBotClient = `[Command("photo")]
public async Task SendPhoto(Context context)
{
    var bot = context.BotClient;

    // Send photo
    await bot.SendPhoto(
        chatId: context.ChatId,
        photo: InputFile.FromUri("https://example.com/photo.jpg"),
        caption: "Here's a photo!"
    );

    // Send location
    await bot.SendLocation(
        chatId: context.ChatId,
        latitude: 40.7128,
        longitude: -74.0060
    );

    // Edit / delete messages
    await bot.EditMessageText(context.ChatId, messageId, "Updated text");
    await bot.DeleteMessage(context.ChatId, messageId);
}`;

export default function ContextPage() {
  return (
    <>
      <h1>Context API</h1>
      <p className="lead">
        The Context object is your gateway to all bot interactions — the update, bot
        client, session, and convenient helper methods.
      </p>

      <h2>Overview</h2>
      <CodeBlock code={contextOverview} language="csharp" filename="Context Usage" />

      <h2>Context properties</h2>
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>BotClient</code></td><td>ITelegramBotClient</td><td>Full access to Telegram Bot API</td></tr>
          <tr><td><code>Update</code></td><td>Update</td><td>The raw Telegram update object</td></tr>
          <tr><td><code>ChatId</code></td><td>long</td><td>Current chat ID (auto-detected)</td></tr>
          <tr><td><code>Message</code></td><td>MessageContext</td><td>Message context with Text property</td></tr>
          <tr><td><code>Callback</code></td><td>CallbackContext</td><td>Callback context with Answer() and Data</td></tr>
          <tr><td><code>Session</code></td><td>Session?</td><td>User session (with SessionMiddleware)</td></tr>
          <tr><td><code>SessionStore</code></td><td>ISessionStore</td><td>Session storage interface</td></tr>
          <tr><td><code>CancellationToken</code></td><td>CancellationToken</td><td>Token for async operations</td></tr>
        </tbody>
      </table>

      <h2>Reply method</h2>
      <p>
        <code>Reply()</code> is a convenient way to send messages to the current chat:
      </p>
      <CodeBlock code={replyExamples} language="csharp" filename="Reply Examples" />
      <CodeBlock
        code={`Task Reply(
    string text,
    ReplyMarkup? replyMarkup = null,
    ParseMode? parseMode = null
)`}
        language="csharp"
        filename="Signature"
      />

      <h2>Callback context</h2>
      <p>Handle inline keyboard button clicks with the Callback context:</p>
      <CodeBlock code={callbackContextExample} language="csharp" filename="Callback Context" />

      <h2>Session access</h2>
      <p>Access user session data through the context (requires SessionMiddleware):</p>
      <CodeBlock code={sessionExample} language="csharp" filename="Session Access" />

      <h2>Advanced: bot client</h2>
      <p>For advanced operations, access the full Telegram Bot Client:</p>
      <CodeBlock code={advancedBotClient} language="csharp" filename="Bot Client" />
    </>
  );
}
