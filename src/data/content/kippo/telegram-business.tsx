import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';

const connection = `// The owner connected the bot — or re-enabled it after a pause.
[BusinessConnection(BusinessConnectionEvent.Connected)]
public async Task Connected(BusinessConnection connection, Context context)
{
    // connection.Id is what lets you message this account's customers later — store it.
    await store.SaveAsync(connection.Id, connection.UserChatId);

    if (connection.Rights?.CanReply == true)
        await context.Reply("Connected ✅ I'll answer your customers while you're away.");
    else
        await context.Reply("Connected, but I'm not allowed to reply yet.");
}

// The owner disconnected the bot, or paused it.
[BusinessConnection(BusinessConnectionEvent.Disconnected)]
public Task Disconnected(BusinessConnection connection)
    => store.RemoveAsync(connection.Id);

// Both transitions in one handler.
[BusinessConnection]
public Task AnyChange(BusinessConnection connection) => audit.LogAsync(connection);`;

const messages = `// Filters are the same as [Text]: Pattern, Contains, Regex, State.
[BusinessMessage(Contains = "price")]
public Task Price(Context context)
    => context.Reply("Our price list: ...");

[BusinessMessage(Regex = @"^\\+?\\d{9,}$")]
public Task PhoneNumber(Context context)
    => context.Reply("Thanks, we'll call you back 📞");

// No filter → every customer message, including photos and voice notes.
[BusinessMessage]
public Task Anything(Context context)
    => context.Reply("Thanks! The team will reply shortly.");`;

const sender = `// Default: only what the CUSTOMER writes.
[BusinessMessage]
public Task FromCustomer(Context context) => context.Reply("Got it!");

// What the account OWNER types in the customer's chat.
[BusinessMessage(From = BusinessSender.Owner)]
public Task FromOwner(Context context)
{
    // e.g. stop the auto-responder once a human joins the conversation
    context.Session.Set("handled_by_human", true);
    return Task.CompletedTask;
}

// Both sides.
[BusinessMessage(From = BusinessSender.Any)]
public Task Transcript(Context context, Message message)
    => archive.AppendAsync(context.ChatId, message);`;

const edits = `// Edited customer messages are ignored unless you opt in.
[BusinessMessage(IncludeEdited = true)]
public Task Any(Context context)
{
    var wasEdited = context.Update.Type == UpdateType.EditedBusinessMessage;
    return context.Reply(wasEdited ? "Noted the edit 📝" : "Got it!");
}

// Messages deleted from a business chat.
[BusinessMessagesDeleted]
public Task Deleted(BusinessMessagesDeleted deleted)
    => archive.MarkDeletedAsync(deleted.Chat.Id, deleted.MessageIds);`;

const replying = `[BusinessMessage(Contains = "hours")]
public async Task Hours(Context context)
{
    // Sent on behalf of the business account — Kippo passes the
    // update's business_connection_id for you.
    await context.Reply("We're open 9:00–18:00, Mon–Sat.");

    // Calling the Bot API directly? Pass the id yourself:
    await context.BotClient.SendMessage(
        chatId: context.ChatId,
        text: "Here's our address: ...",
        businessConnectionId: context.BusinessConnectionId);
}

// Shared handler used by both worlds
[Text(Pattern = "help")]
[BusinessMessage(Pattern = "help")]
public Task Help(Context context)
    => context.Reply(context.IsBusiness
        ? "A manager will be with you shortly."
        : "Try /start to see what I can do.");`;

const testing = `var bot = new TestBot<SupportHandler>();

// The account owner connects the bot
await bot.SendBusinessConnection(isEnabled: true, canReply: true);

// A customer writes in
await bot.SendBusinessMessage("what is the price?");

Assert.Equal("Our price list: ...", bot.LastReply!.Text);
Assert.Equal("biz_1", bot.LastReply.BusinessConnectionId);

// The owner replies themselves
await bot.SendBusinessMessageFromOwner("I'll take it from here");

// …and later deletes two messages
await bot.SendBusinessMessagesDeleted(new[] { 11, 12 });`;

export default function TelegramBusiness() {
  return (
    <>
      <h1>Telegram Business</h1>
      <p className="lead">
        A Telegram Business account owner can connect your bot to their account. The bot then sees
        the chats between that account and its customers, and can answer on the account's behalf —
        an auto-responder, a greeter, or a full support assistant. Kippo routes those updates with
        three attributes.
      </p>

      <h2>How it works</h2>
      <ol>
        <li>
          A Business user opens <em>Settings → Business → Chatbots</em> and picks your bot, granting
          it a set of rights (replying, reading messages, managing gifts, …).
        </li>
        <li>
          Telegram sends a <code>business_connection</code> update carrying the{' '}
          <strong>connection id</strong> — the token every later call on that account needs.
        </li>
        <li>
          From then on, every message in that account's customer chats arrives as a{' '}
          <code>business_message</code> update, and your handlers reply as the business account.
        </li>
      </ol>

      <Callout type="info" title="Nothing to configure">
        Kippo subscribes to the business update types in both long-polling and webhook mode.
        Telegram only starts sending them once an account owner connects your bot.
      </Callout>

      <h2>[BusinessConnection] — the account connects</h2>
      <p>
        Persist <code>connection.Id</code> here. It is how you message that account's customers
        later (from a background job, an admin panel, or a webhook of your own), and it is the only
        way to know which of your business accounts an update belongs to.
      </p>
      <CodeBlock code={connection} language="csharp" filename="Connection lifecycle" />

      <Callout type="warning" title="Check the rights you were granted">
        The owner chooses what the bot may do. <code>connection.Rights?.CanReply</code> tells you
        whether the bot can answer customers at all; other flags cover reading messages, deleting,
        editing the profile, gifts and stars. Rights can change at any time — a new{' '}
        <code>business_connection</code> update is sent when they do.
      </Callout>

      <h2>[BusinessMessage] — the customer writes</h2>
      <p>
        Matching mirrors <code>[Text]</code>: <code>Pattern</code> (exact, case-insensitive),{' '}
        <code>Contains</code>, <code>Regex</code>, and <code>State</code> for session-scoped
        handlers. Most specific matches first; a bare <code>[BusinessMessage]</code> is the
        catch-all.
      </p>
      <CodeBlock code={messages} language="csharp" filename="Business messages" />

      <h2>Customer or owner?</h2>
      <p>
        A business chat has two sides, and Telegram sends both to your bot. By default{' '}
        <code>[BusinessMessage]</code> only matches the <strong>customer</strong> (
        <code>From = BusinessSender.Customer</code>), so an auto-responder never answers the account
        owner — and never answers itself.
      </p>
      <CodeBlock code={sender} language="csharp" filename="Message direction" />

      <Callout type="tip" title="Hand off to a human">
        Owner messages are the natural signal that a person took over: flip a session flag in a{' '}
        <code>BusinessSender.Owner</code> handler and let your customer handlers bail out while it
        is set.
      </Callout>

      <h2>Edits and deletions</h2>
      <CodeBlock code={edits} language="csharp" filename="Edited and deleted" />

      <h2>Replying as the business account</h2>
      <p>
        <code>context.Reply(...)</code> inside a business handler is sent on behalf of the business
        account — Kippo attaches the update's <code>business_connection_id</code> automatically. When
        you call the Bot API yourself, pass <code>context.BusinessConnectionId</code>.
      </p>
      <CodeBlock code={replying} language="csharp" filename="Replying" />

      <h2>Context members</h2>
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>context.IsBusiness</code></td>
            <td>bool</td>
            <td>Whether this update came through a business connection.</td>
          </tr>
          <tr>
            <td><code>context.BusinessConnectionId</code></td>
            <td>string?</td>
            <td>The connection id, or <code>null</code> in ordinary chats.</td>
          </tr>
          <tr>
            <td><code>context.ChatId</code></td>
            <td>long</td>
            <td>The customer's chat; for connection updates, the owner's chat.</td>
          </tr>
          <tr>
            <td><code>context.Business.Connection</code></td>
            <td>BusinessConnection</td>
            <td>The connection payload (<code>[BusinessConnection]</code> handlers).</td>
          </tr>
          <tr>
            <td><code>context.Business.Message</code></td>
            <td>Message</td>
            <td>The business message (<code>[BusinessMessage]</code> handlers).</td>
          </tr>
          <tr>
            <td><code>context.Business.DeletedMessages</code></td>
            <td>BusinessMessagesDeleted</td>
            <td>Chat and message ids of a deletion update.</td>
          </tr>
          <tr>
            <td><code>context.Business.Rights</code></td>
            <td>BusinessBotRights?</td>
            <td>What the owner allowed the bot to do.</td>
          </tr>
          <tr>
            <td><code>context.Business.CanReply</code></td>
            <td>bool</td>
            <td>Shortcut for <code>Rights?.CanReply == true</code>.</td>
          </tr>
          <tr>
            <td><code>context.Business.IsEnabled</code></td>
            <td>bool</td>
            <td>Whether the connection update reports an active connection.</td>
          </tr>
          <tr>
            <td><code>context.Business.FromOwner</code></td>
            <td>bool</td>
            <td>Whether the account owner, not the customer, wrote this message.</td>
          </tr>
        </tbody>
      </table>
      <p>
        <code>BusinessConnection</code>, <code>BusinessMessagesDeleted</code> and{' '}
        <code>Message</code> also bind straight as handler parameters, so most handlers never touch{' '}
        <code>context.Business</code> at all.
      </p>

      <h2>Testing business chats</h2>
      <p>
        <code>TestBot</code> can play both sides of a business conversation — no token, no network:
      </p>
      <CodeBlock code={testing} language="csharp" filename="BusinessTests.cs" />

      <Callout type="warning" title="Scenes don't run in business chats yet">
        <code>await ctx.Ask(...)</code> dialogs are driven by ordinary messages and callback taps;
        a business message does not currently advance a scene. Use{' '}
        <code>[BusinessMessage(State = "...")]</code> with the session for multi-step business flows.
      </Callout>

      <Callout type="info" title="One bot, many accounts">
        Every connected account has its own connection id, and the same handlers serve all of them.
        Key anything you store by <code>context.BusinessConnectionId</code> (or by the customer's{' '}
        <code>ChatId</code>) so two accounts never read each other's data.
      </Callout>
    </>
  );
}
