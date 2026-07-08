import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';

const basicFallback = `[Fallback]
public async Task Unknown(Context context)
{
    await context.Reply("I don't understand. Try /help");
}`;

const branchingFallback = `[Fallback]
public async Task Unknown(Context context)
{
    // Fires for any update type that matched nothing else
    if (context.Update.Type == UpdateType.CallbackQuery)
    {
        await context.Callback.Answer("Expired button");
        return;
    }

    await context.Reply("Unknown command. Type /help for options.");
}`;

export default function RoutingFallback() {
  return (
    <>
      <h1>[Fallback] Attribute</h1>
      <p className="lead">
        A catch-all handler invoked when an update matches no other handler.
      </p>

      <h2>Basic usage</h2>
      <p>
        Mark one method with <code>[Fallback]</code>. It runs only after every command,
        callback, text, contact and chat-member handler has been checked and none matched —
        ideal for replying to unknown commands.
      </p>
      <CodeBlock code={basicFallback} language="csharp" filename="Fallback Handler" />

      <h2>Handling any update type</h2>
      <p>
        The fallback fires for <em>any</em> unmatched update, so branch on
        <code>context.Update.Type</code> when you need different behavior:
      </p>
      <CodeBlock code={branchingFallback} language="csharp" filename="Branching Fallback" />

      <Callout type="warning" title="A bare [Text] catches all text first">
        A <code>[Text]</code> handler with no conditions already matches every text message,
        so the fallback will never see plain text. Unknown <code>/commands</code> still reach
        the fallback because they start with <code>/</code> and are not treated as text.
      </Callout>

      <Callout type="info" title="Runs inside the middleware pipeline">
        The fallback is a route, not a middleware — your logging, auth and rate-limit
        middleware still wrap it. Only one <code>[Fallback]</code> is used; declaring more
        than one logs a warning and the last one wins.
      </Callout>
    </>
  );
}
