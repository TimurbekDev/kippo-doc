import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';

const basic = `[Contact]
public async Task OnContact(Context context, Contact contact)
{
    context.Session.Set("phone", contact.PhoneNumber);
    await context.Reply($"Thanks! Saved {contact.PhoneNumber} ✅");
}`;

const askForIt = `[Command("phone")]
public async Task AskPhone(Context context)
{
    var keyboard = ReplyKeyboardBuilder.Create()
        .ContactButton("📱 Share my number")
        .Resize()
        .OneTime()
        .Build();

    await context.Reply("Tap the button to share your phone number:", keyboard);
}

[Contact]
public async Task OnContact(Context context, Contact contact)
{
    // contact.UserId is set only when the user shared their OWN contact
    if (contact.UserId != context.Update.Message!.From!.Id)
    {
        await context.Reply("Please share your own number, not someone else's 🙂");
        return;
    }

    context.Session.Set("phone", contact.PhoneNumber);
    await context.Reply($"Verified {contact.PhoneNumber} ✅", new ReplyKeyboardRemove());
}`;

const fields = `[Contact]
public async Task OnContact(Context context, Contact contact)
{
    var phone  = contact.PhoneNumber;   // always present
    var first  = contact.FirstName;     // always present
    var last   = contact.LastName;      // may be null
    var userId = contact.UserId;        // null when the contact is not a Telegram user

    await context.Reply($"{first} {last} — {phone} (telegram id: {userId?.ToString() ?? "none"})");
}`;

export default function RoutingContacts() {
  return (
    <>
      <h1>[Contact] Attribute</h1>
      <p className="lead">
        Handle contact messages — the payload Telegram sends when a user shares a phone number,
        typically after tapping a <code>ContactButton</code>.
      </p>

      <h2>Basic usage</h2>
      <p>
        Mark a method with <code>[Contact]</code> and take a <code>Contact</code> parameter. The
        handler runs for any message carrying a contact, before text handlers are considered.
      </p>
      <CodeBlock code={basic} language="csharp" filename="Contact Handler" />

      <h2>Asking for the number</h2>
      <p>
        Telegram only lets a bot receive a phone number if the user hands it over deliberately.
        Request it with a contact button on a reply keyboard:
      </p>
      <CodeBlock code={askForIt} language="csharp" filename="Phone verification" />

      <Callout type="warning" title="A shared contact may be someone else">
        The contact button also lets users forward a contact from their address book. Compare{' '}
        <code>contact.UserId</code> with the sender's id when the number must belong to the person
        you are talking to.
      </Callout>

      <h2>What the payload carries</h2>
      <CodeBlock code={fields} language="csharp" filename="Contact fields" />

      <Callout type="info" title="Handling phone numbers">
        A phone number is personal data: store only what you need, keep it out of logs, and tell
        users what it is used for.
      </Callout>
    </>
  );
}
