import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';

const theProblem = `// ❌ Without scenes, a multi-step flow is scattered across handlers
// wired together by hand with string state and a session bag:
[Command("signup")]
public async Task Start(Context c)
{
    c.Session!.SetState("awaiting_name");
    await c.Reply("What's your name?");
}

[Text(State = "awaiting_name")]
public async Task Name(Context c)
{
    c.Session!.Set("name", c.Message.Text);
    c.Session.SetState("awaiting_age");
    await c.Reply("How old are you?");
}

[Text(State = "awaiting_age")]
public async Task Age(Context c) { /* ...and so on */ }`;

const theScene = `// ✅ With a scene, the same flow reads top-to-bottom as ordinary code
[Command("signup")]
public Task Start(Context c)
{
    c.EnterScene("signup");   // sends the first prompt, then hands control to the scene
    return Task.CompletedTask;
}

[Scene("signup")]
public async Task Signup(SceneContext ctx)
{
    var name = await ctx.Ask("What's your name?");
    await ctx.Reply($"Hi {name}! 👋");

    var age = await ctx.Ask<int>("How old are you?", retry: "Please send a number 🙂");

    await ctx.Reply($"All set, {name} — registered at age {age}. ✅");
}`;

const typedAsk = `// Ask<T> parses the reply and re-asks on invalid input
var age    = await ctx.Ask<int>("Your age?", retry: "That's not a number.");
var id     = await ctx.Ask<Guid>("Paste your order id:");
var size   = await ctx.Ask<Size>("Pick a size (Small/Medium/Large):");  // enum

enum Size { Small, Medium, Large }`;

const cancel = `// A scene runs until it returns. Give users an escape hatch with a command —
// commands are NOT swallowed by an active scene, so this always works:
[Command("cancel")]
public async Task Cancel(Context c)
{
    if (c.InScene)
    {
        c.ExitScene();
        await c.Reply("Cancelled. ❌");
    }
}`;

const services = `// Scenes support dependency injection just like normal handlers
[Scene("order")]
public async Task Order(SceneContext ctx, IProductRepository products)
{
    var sku = await ctx.Ask("Enter the product SKU:");
    var product = await products.FindAsync(sku);

    if (product is null)
    {
        await ctx.Reply("Unknown SKU. Exiting.");
        return;   // returning early ends the scene
    }

    var qty = await ctx.Ask<int>($"How many {product.Name}?");
    await ctx.Reply($"Added {qty} × {product.Name} to your cart. 🛒");
}`;

const testing = `[Fact]
public async Task Signup_collects_name_and_age()
{
    var bot = new TestBot<SignupHandler>();

    await bot.SendCommand("signup");
    Assert.Equal("What's your name?", bot.LastReply?.Text);

    await bot.SendText("Timur");
    Assert.Equal("How old are you?", bot.LastReply?.Text);

    await bot.SendText("oops");                       // invalid
    Assert.Equal("Please send a number 🙂", bot.LastReply?.Text);

    await bot.SendText("30");
    Assert.Equal("All set, Timur — registered at age 30. ✅", bot.LastReply?.Text);
    Assert.False(bot.InScene);                          // scene completed
}`;

export default function Scenes() {
  return (
    <>
      <h1>Scenes &amp; Conversations</h1>
      <p className="lead">
        Write multi-step dialogs — registration, checkout, surveys — as plain sequential code with{' '}
        <code>await ctx.Ask(...)</code>, instead of scattering handlers across a hand-rolled state
        machine. Scenes are resumable, type-safe, and testable.
      </p>

      <h2>The problem scenes solve</h2>
      <p>
        A conversation is inherently linear, but attribute routing forces you to split it into
        disconnected handlers glued together by session state:
      </p>
      <CodeBlock code={theProblem} language="csharp" filename="Without scenes" />

      <h2>The same flow as a scene</h2>
      <CodeBlock code={theScene} language="csharp" filename="With a scene" />

      <Callout type="success" title="Reads like a script, runs like a state machine">
        Each <code>ctx.Ask</code> sends a prompt and returns the user's next reply. Between messages
        the framework persists progress to the session and resumes exactly where it left off — even
        across bot restarts when backed by a persistent <code>ISessionStore</code>.
      </Callout>

      <h2>Entering a scene</h2>
      <p>
        Call <code>context.EnterScene("name")</code> from any handler — a command, a button, a text
        match. The scene's first prompt is sent immediately, and the user's following text replies are
        routed into the scene until it finishes.
      </p>

      <h2>Typed &amp; validated questions</h2>
      <p>
        <code>Ask&lt;T&gt;</code> converts the reply to <code>int</code>, <code>long</code>,{' '}
        <code>Guid</code>, <code>decimal</code>, an <code>enum</code>, and more. If conversion fails,
        the bot sends the <code>retry</code> message and waits for another answer — the step repeats
        until the input is valid.
      </p>
      <CodeBlock code={typedAsk} language="csharp" filename="Typed questions" />

      <h2>Injecting services</h2>
      <p>
        Scene methods bind parameters the same way handlers do: <code>SceneContext</code>,{' '}
        <code>Context</code>, and any service from DI (each turn runs in its own scope). Return early
        at any point to end the scene.
      </p>
      <CodeBlock code={services} language="csharp" filename="Scenes with DI" />

      <h2>Cancelling</h2>
      <p>
        A scene only intercepts plain text — commands still reach their handlers, so users can always
        type a command to break out. Use <code>context.InScene</code> and{' '}
        <code>context.ExitScene()</code> to implement an explicit cancel:
      </p>
      <CodeBlock code={cancel} language="csharp" filename="Cancelling a scene" />

      <h2>Testing scenes</h2>
      <p>
        Because scenes run through the normal pipeline, <code>TestBot</code> drives them turn by turn
        with no bot token or network:
      </p>
      <CodeBlock code={testing} language="csharp" filename="SignupTests.cs" />

      <Callout type="info" title="How replay works">
        A scene method is re-run from the top on every incoming message. Already-answered{' '}
        <code>Ask</code> calls return their stored answers instantly, so only the next unanswered
        question prompts the user. Messages sent via <code>ctx.Reply</code> are suppressed during this
        replay, so each turn produces exactly one new prompt — never a duplicate.
      </Callout>

      <Callout type="warning" title="Keep scene bodies deterministic">
        Since the body replays each turn, side effects must go through <code>ctx.Reply</code> (which is
        replay-aware) rather than the raw <code>ctx.Context.Reply</code>. Avoid non-idempotent work
        (charging a card, writing a row) <em>between</em> asks; do it after the final answer, or guard
        it behind the value you just collected.
      </Callout>

      <h2>Best practices</h2>
      <ul>
        <li>Give every scene a <code>/cancel</code> escape hatch</li>
        <li>Use <code>Ask&lt;T&gt;</code> with a helpful <code>retry</code> message for validated input</li>
        <li>Do irreversible work after the last <code>Ask</code>, not between steps</li>
        <li>Back sessions with Redis or a database so in-progress scenes survive restarts</li>
        <li>Test the whole flow with <code>TestBot</code> — one <code>SendText</code> per answer</li>
      </ul>
    </>
  );
}
