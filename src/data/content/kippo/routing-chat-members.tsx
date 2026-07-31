import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';

const basic = `[ChatMember]
public async Task OnChatMember(Context context, ChatMemberUpdated update)
{
    var user   = update.NewChatMember.User;
    var status = update.NewChatMember.Status;

    await context.Reply($"{user.FirstName} is now {status}");
}`;

const joinsAndLeaves = `[ChatMember]
public async Task OnChatMember(Context context, ChatMemberUpdated update)
{
    var was = update.OldChatMember.Status;
    var now = update.NewChatMember.Status;
    var user = update.NewChatMember.User;

    // Joined: was outside the chat, now a member
    if (was is ChatMemberStatus.Left or ChatMemberStatus.Kicked &&
        now is ChatMemberStatus.Member)
    {
        await context.Reply($"Welcome, {user.FirstName}! 👋");
        return;
    }

    // Left or was removed
    if (now is ChatMemberStatus.Left or ChatMemberStatus.Kicked)
    {
        await context.Reply($"{user.FirstName} left the chat.");
        return;
    }

    // Promoted to admin
    if (now is ChatMemberStatus.Administrator)
        await context.Reply($"{user.FirstName} is now an admin. 👑");
}`;

const botItself = `[ChatMember]
public async Task OnChatMember(Context context, ChatMemberUpdated update)
{
    // my_chat_member updates concern the bot's own membership
    if (update.NewChatMember.User.Id == context.BotClient.BotId)
    {
        if (update.NewChatMember.Status is ChatMemberStatus.Member
                                        or ChatMemberStatus.Administrator)
            await context.Reply("Thanks for adding me! Type /help to get started.");

        return;
    }
}`;

const allowedUpdates = `// Webhook mode only: Telegram's default allowed_updates excludes chat_member,
// so subscribe to it explicitly once at startup (or from any admin tool).
await botClient.SetWebhook(
    url: "https://example.com/bot",
    secretToken: secret,
    allowedUpdates:
    [
        UpdateType.Message,
        UpdateType.CallbackQuery,
        UpdateType.MyChatMember,
        UpdateType.ChatMember,
    ]);`;

export default function RoutingChatMembers() {
  return (
    <>
      <h1>[ChatMember] Attribute</h1>
      <p className="lead">
        React to membership changes — users joining or leaving, promotions and bans, and your
        bot being added to or removed from a chat.
      </p>

      <h2>Basic usage</h2>
      <p>
        Mark a method with <code>[ChatMember]</code> and take a{' '}
        <code>ChatMemberUpdated</code> parameter. It receives both Telegram update types:{' '}
        <code>chat_member</code> (someone else's membership changed) and{' '}
        <code>my_chat_member</code> (your bot's own membership changed).
      </p>
      <CodeBlock code={basic} language="csharp" filename="Chat Member Handler" />

      <h2>Joins, leaves and promotions</h2>
      <p>
        Telegram does not label the event — it hands you the previous and the new membership, so
        compare <code>OldChatMember.Status</code> with <code>NewChatMember.Status</code>:
      </p>
      <CodeBlock code={joinsAndLeaves} language="csharp" filename="Welcome & goodbye" />

      <h2>When the bot itself is added</h2>
      <p>
        Check the affected user's id against <code>context.BotClient.BotId</code> to greet a chat
        the moment your bot is added to it:
      </p>
      <CodeBlock code={botItself} language="csharp" filename="Bot added to a chat" />

      <Callout type="info" title="Admin rights in groups">
        Telegram only reports other users' membership changes to administrators — a handler that
        never fires in a group usually means the bot is a plain member. Updates about the bot
        itself (<code>my_chat_member</code>) always arrive.
      </Callout>

      <h2>Subscribing to the updates</h2>
      <p>
        With long polling Kippo already subscribes to both <code>chat_member</code> and{' '}
        <code>my_chat_member</code> — nothing to configure. Over{' '}
        <strong>webhooks</strong>, Telegram's default <code>allowed_updates</code> leaves{' '}
        <code>chat_member</code> out, so name it when registering the webhook:
      </p>
      <CodeBlock code={allowedUpdates} language="csharp" filename="Webhook subscription" />
    </>
  );
}
