import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';
import { useDocs } from '../../../context/DocsProvider';

const basic = `[Command("signup")]
public Task Start(Context context)
{
    context.EnterScene("signup");   // sends the first prompt, then hands over to the scene
    return Task.CompletedTask;
}

[Scene("signup")]
public async Task Signup(SceneContext ctx)
{
    var name = await ctx.Ask("What's your name?");
    var age  = await ctx.Ask<int>("How old are you?", retry: "Please send a number 🙂");

    await ctx.Reply($"Welcome {name}, age {age}! ✅");
}`;

const routingWhileActive = `// While a scene is active:
//   plain text            -> fed into the scene as the next answer
//   the scene's own buttons -> answer the current question
//   /commands             -> still routed normally (your escape hatch)
//   other callback queries -> still routed to their [CallbackQuery] handlers

[Command("cancel")]
public async Task Cancel(Context context)
{
    if (context.InScene)
    {
        context.ExitScene();
        await context.Reply("Cancelled ❌");
    }
}`;

const di = `[Scene("order")]
public async Task Order(SceneContext ctx, IProductRepository products, Context context)
{
    var sku = await ctx.Ask("Enter the product SKU:");
    var product = await products.FindAsync(sku);
    // ...
}`;

export default function RoutingScenes() {
  const { hrefFor } = useDocs();

  return (
    <>
      <h1>[Scene] Attribute</h1>
      <p className="lead">
        Routes an entire multi-step dialog to a single method. Instead of one handler per step, a
        scene reads top-to-bottom and pauses at each <code>await ctx.Ask(...)</code>.
      </p>

      <h2>Basic usage</h2>
      <p>
        Give the scene a unique name, take a <code>SceneContext</code> parameter, and enter it from
        any handler with <code>context.EnterScene("name")</code>:
      </p>
      <CodeBlock code={basic} language="csharp" filename="Scene Handler" />

      <h2>How it affects routing</h2>
      <p>
        A scene does not replace the routing table — it sits in front of it for the messages it
        needs:
      </p>
      <CodeBlock code={routingWhileActive} language="csharp" filename="Routing during a scene" />

      <Callout type="info" title="Commands always get through">
        Because slash commands are never swallowed by an active scene, <code>/cancel</code> and{' '}
        <code>/help</code> keep working mid-dialog. Use <code>context.InScene</code> to tell whether
        the user is inside one.
      </Callout>

      <h2>Parameters</h2>
      <p>
        Scene methods bind like normal handlers: <code>SceneContext</code>, <code>Context</code>, and
        any service resolved from DI — each turn runs in its own scope.
      </p>
      <CodeBlock code={di} language="csharp" filename="Scene with DI" />

      <Callout type="warning" title="One method per scene name">
        Scene names are matched exactly (case-sensitive). Registering two methods under the same
        name logs a warning and the last one wins; entering a name with no matching scene clears the
        scene state.
      </Callout>

      <p>
        The full guide — typed questions, inline-button answers, replay semantics and testing — is on
        the <Link to={hrefFor('scenes')}>Scenes &amp; Conversations</Link> page.
      </p>
    </>
  );
}
