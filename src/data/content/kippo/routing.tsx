import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';
import { useDocs } from '../../../context/DocsProvider';

/** Every routing attribute Kippo ships, in dispatch order. */
const ATTRIBUTES = [
  {
    name: '[Command]',
    section: 'routing-commands',
    color: 'text-blue-400',
    summary: 'Handle bot commands starting with /',
  },
  {
    name: '[Text]',
    section: 'routing-text',
    color: 'text-green-400',
    summary: 'Handle text messages with pattern matching',
  },
  {
    name: '[CallbackQuery]',
    section: 'routing-callbacks',
    color: 'text-purple-400',
    summary: 'Handle inline button clicks, with typed templates',
  },
  {
    name: '[ChatMember]',
    section: 'routing-chat-members',
    color: 'text-amber-400',
    summary: 'Handle member joins, leaves, and status changes',
  },
  {
    name: '[Contact]',
    section: 'routing-contacts',
    color: 'text-pink-400',
    summary: 'Handle shared phone-number contacts',
  },
  {
    name: '[Scene]',
    section: 'routing-scenes',
    color: 'text-cyan-400',
    summary: 'Route a whole multi-step dialog to one method',
  },
  {
    name: '[BusinessMessage]',
    section: 'telegram-business',
    color: 'text-teal-400',
    summary: 'Answer customers of a connected Telegram Business account',
  },
  {
    name: '[Fallback]',
    section: 'routing-fallback',
    color: 'text-orange-400',
    summary: 'Catch updates that matched no other handler',
  },
];

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
}

// Typed template — {placeholders} are parsed and bound to parameters
[CallbackQuery("product:{id}:{action}")]
public async Task HandleProduct(Context context, int id, string action)
{
    await context.Callback.Answer();
    await context.Reply($"Product {id} → {action}");
}`;

const chatMemberExample = `// Handle chat member updates (joins, leaves, promotions, bot added/removed)
[ChatMember]
public async Task OnChatMember(Context context, ChatMemberUpdated update)
{
    var status = update.NewChatMember.Status;
    var user = update.NewChatMember.User;
    await context.Reply($"{user.FirstName} is now {status}");
}`;

const contactExample = `// Handle shared contacts (e.g. from a "Share phone number" button)
[Contact]
public async Task OnContact(Context context, Contact contact)
{
    context.Session!.Data["phone"] = contact.PhoneNumber;
    await context.Reply($"Thanks! Saved {contact.PhoneNumber}");
}`;

const sceneExample = `// Enter the scene from any handler…
[Command("signup")]
public Task Start(Context context)
{
    context.EnterScene("signup");
    return Task.CompletedTask;
}

// …and write the dialog as ordinary sequential code
[Scene("signup")]
public async Task Signup(SceneContext ctx)
{
    var name = await ctx.Ask("What's your name?");
    var age  = await ctx.Ask<int>("How old are you?", retry: "Please send a number 🙂");

    await ctx.Reply($"Welcome {name}, age {age}! ✅");
}`;

const businessExample = `// A customer wrote to a Telegram Business account your bot is connected to.
// The reply is sent on behalf of that business account.
[BusinessMessage(Contains = "price")]
public async Task Price(Context context)
{
    await context.Reply("Our price list: ...");
}

// The owner connected (or disconnected) the bot
[BusinessConnection(BusinessConnectionEvent.Connected)]
public Task Connected(BusinessConnection connection)
    => store.SaveAsync(connection.Id, connection.UserChatId);`;

const fallbackExample = `[Fallback]
public async Task Unknown(Context context)
{
    await context.Reply("I don't understand. Try /help");
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
  const { hrefFor } = useDocs();

  return (
    <>
      <h1>Routing</h1>
      <p className="lead">
        Kippo routes Telegram updates to your handler methods using attributes — no
        complex configuration, just decorate your methods.
      </p>

      <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ATTRIBUTES.map((attr) => (
          <Link
            key={attr.name}
            to={hrefFor(attr.section)}
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 no-underline transition-colors hover:border-zinc-600 hover:bg-zinc-800"
          >
            <h3 className={`mb-1 font-mono font-semibold ${attr.color}`}>{attr.name}</h3>
            <p className="text-sm text-zinc-400">{attr.summary}</p>
          </Link>
        ))}
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
      <p>
        Handle inline keyboard button presses with exact, wildcard, or typed template
        matching. Template <code>{'{placeholders}'}</code> are parsed from the callback
        data and bound to your handler parameters by name — with automatic type
        conversion:
      </p>
      <CodeBlock code={callbackExample} language="csharp" filename="Callback Handlers" />

      <Callout type="info" title="Typed callback data">
        A pattern like <code>product:{'{id}'}:{'{action}'}</code> matches
        <code>product:42:buy</code> and binds <code>id = 42</code> (as <code>int</code>)
        and <code>action = "buy"</code>. Supports <code>int</code>, <code>long</code>,
        <code>Guid</code>, <code>bool</code>, enums, and more. See the{' '}
        <strong>Callback Queries</strong> page for the full reference.
      </Callout>

      <h2>[ChatMember] Attribute</h2>
      <p>
        Handle chat member updates — users joining or leaving, status changes, and your
        bot being added to or removed from a chat:
      </p>
      <CodeBlock code={chatMemberExample} language="csharp" filename="Chat Member Handlers" />

      <h2>[Contact] Attribute</h2>
      <p>Handle contact messages, such as a user sharing their phone number:</p>
      <CodeBlock code={contactExample} language="csharp" filename="Contact Handlers" />

      <h2>[Scene] Attribute</h2>
      <p>
        Route an entire multi-step dialog to one method. The scene runs top-to-bottom, pausing at
        each <code>await ctx.Ask(...)</code>, and intercepts the user's replies until it finishes:
      </p>
      <CodeBlock code={sceneExample} language="csharp" filename="Scene Handlers" />

      <h2>[BusinessMessage] Attribute</h2>
      <p>
        Handle the chats of a Telegram Business account that connected your bot.{' '}
        <code>[BusinessMessage]</code> takes the same filters as <code>[Text]</code> and matches the
        customer's side by default; <code>[BusinessConnection]</code> and{' '}
        <code>[BusinessMessagesDeleted]</code> cover the connection lifecycle and deletions:
      </p>
      <CodeBlock code={businessExample} language="csharp" filename="Business Handlers" />
      <p>
        See <Link to={hrefFor('telegram-business')}>Telegram Business</Link> for rights, message
        direction, and replying on behalf of the account.
      </p>

      <h2>[Fallback] Attribute</h2>
      <p>
        A single catch-all, invoked only when no other handler matched the update — the place to
        answer unknown commands or expired buttons:
      </p>
      <CodeBlock code={fallbackExample} language="csharp" filename="Fallback Handler" />

      <h2>Multiple Attributes</h2>
      <p>A single handler can respond to multiple triggers:</p>
      <CodeBlock code={multipleAttributesExample} language="csharp" filename="Multiple Triggers" />

      <h2>Dispatch order</h2>
      <p>Every update walks the same path, first match wins:</p>
      <ol>
        <li>
          An active <Link to={hrefFor('routing-scenes')}>scene</Link> takes plain text and its own
          <code>Ask</code> buttons
        </li>
        <li><code>[Command]</code> — messages starting with <code>/</code></li>
        <li><code>[CallbackQuery]</code> — inline button presses, in declaration order</li>
        <li><code>[Contact]</code> — messages carrying a shared contact</li>
        <li><code>[Text]</code> — plain text, most specific handler first</li>
        <li>
          <code>[BusinessMessage]</code>, <code>[BusinessConnection]</code>,{' '}
          <code>[BusinessMessagesDeleted]</code> — updates from connected business accounts
        </li>
        <li><code>[ChatMember]</code> — membership updates</li>
        <li><code>[Fallback]</code> — everything left over</li>
      </ol>
      <p>
        Middleware wraps the whole sequence, so logging, auth and rate limiting apply to every one
        of these routes.
      </p>
    </>
  );
}
