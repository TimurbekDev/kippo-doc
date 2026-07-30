import { CodeBlock } from '../../../components/docs/CodeBlock';
import { Callout } from '../../../components/docs/Callout';

const theProblem = `// ❌ Telegram rejects callback_data longer than 64 bytes.
// A GUID + a coupon code + a few fields overflow it silently in production:
new InlineKeyboardBuilder()
    .Button("Buy", $"order:{orderId}:{coupon}:{qty}:{userId}:{timestamp}")  // > 64 bytes 💥
    .Build();`;

const payloadButton = `[Command("buy")]
public Task Buy(Context context)
{
    var keyboard = context.Inline()                       // vault-bound builder
        .Payload("✅ Buy", "order:buy", new Order(
            Id: 42,
            Coupon: "SUMMER-2026-EXTRA-LONG-COUPON-CODE",
            Qty: 3))
        .Build();

    return context.Reply("Confirm your order:", keyboard);
}

// The payload is rebound to a typed parameter on tap — no manual parsing
[CallbackQuery("order:buy")]
public async Task OnBuy(Context context, Order order)
{
    await context.Callback.Answer();
    await context.Reply($"Ordered {order.Qty}× #{order.Id} ({order.Coupon})");
}

public record Order(int Id, string Coupon, int Qty);`;

const howItWorks = `// On the wire the button carries only a short token, well under 64 bytes:
//   kv:pQ8n3Zk1S0aXcV2bN4mL6w
//
// 1. .Payload(text, route, obj) JSON-serializes obj, stores it in the
//    ICallbackStore, and puts "kv:<token>" on the button.
// 2. On tap, CallbackVaultMiddleware resolves the token, rewrites the
//    callback data back to "order:buy" (so [CallbackQuery] matches as usual)
//    and stashes the payload.
// 3. The router deserializes the payload into your typed handler parameter.`;

const storeInterface = `public interface ICallbackStore
{
    // Persist data, return a short token that fits in a button
    string Save(string data);

    // Resolve a token; false if unknown or expired
    bool TryLoad(string token, out string data);
}`;

const redisStore = `using StackExchange.Redis;

public class RedisCallbackStore : ICallbackStore
{
    private readonly IDatabase _db;
    private readonly TimeSpan _ttl = TimeSpan.FromDays(1);

    public RedisCallbackStore(IConnectionMultiplexer redis) => _db = redis.GetDatabase();

    public string Save(string data)
    {
        var token = Guid.NewGuid().ToString("N");
        _db.StringSet($"cb:{token}", data, _ttl);
        return token;
    }

    public bool TryLoad(string token, out string data)
    {
        var val = _db.StringGet($"cb:{token}");
        data = val.HasValue ? val! : string.Empty;
        return val.HasValue;
    }
}

// Register BEFORE AddKippo to override the default in-memory store
builder.Services.AddSingleton<ICallbackStore, RedisCallbackStore>();
builder.Services.AddKippo<MyHandler>(builder.Configuration);`;

export default function CallbackVault() {
  return (
    <>
      <h1>Callback Vault</h1>
      <p className="lead">
        Attach arbitrarily large, strongly-typed payloads to inline buttons — past Telegram's 64-byte{' '}
        <code>callback_data</code> limit. Kippo stores the payload behind a short token and rebinds it
        to a typed handler parameter when the button is tapped.
      </p>

      <h2>The 64-byte problem</h2>
      <p>
        Telegram caps <code>callback_data</code> at 64 bytes. Pack an id, an action, and a couple of
        fields and you overflow it — often discovered only in production, where the button silently
        fails.
      </p>
      <CodeBlock code={theProblem} language="csharp" filename="The trap" />

      <h2>Payload buttons</h2>
      <p>
        Build the keyboard with <code>context.Inline()</code> and add a button via{' '}
        <code>.Payload(text, route, payload)</code>. The payload can be any JSON-serializable object of
        any size. Give the button a routing key and a handler that matches it — the payload arrives as
        a typed parameter.
      </p>
      <CodeBlock code={payloadButton} language="csharp" filename="Payload buttons" />

      <Callout type="success" title="Enabled out of the box">
        <code>AddKippo</code> registers the callback vault automatically — an in-memory{' '}
        <code>ICallbackStore</code> and the middleware that rehydrates tokens. Just use{' '}
        <code>context.Inline().Payload(...)</code>.
      </Callout>

      <h2>How it works</h2>
      <CodeBlock code={howItWorks} language="csharp" filename="Under the hood" />

      <h2>The store</h2>
      <p>
        The default <code>InMemoryCallbackStore</code> keeps tokens with a sliding TTL (24h) and a
        capacity cap (100k entries, oldest evicted first). Swap in your own <code>ICallbackStore</code>{' '}
        to control lifetime and scope.
      </p>
      <CodeBlock code={storeInterface} language="csharp" filename="ICallbackStore" />

      <Callout type="warning" title="In-memory tokens don't survive restarts">
        The default store lives in process memory. After a restart — or on a second instance behind a
        load balancer — old tokens no longer resolve and tapping a stale button does nothing. For
        scaled or restart-tolerant bots, register a distributed store (Redis, database).
      </Callout>

      <h3>Redis store</h3>
      <CodeBlock code={redisStore} language="csharp" filename="RedisCallbackStore.cs" />

      <h2>When to use it</h2>
      <ul>
        <li>Payloads that exceed 64 bytes: long coupon codes, GUIDs, composite keys, JSON blobs</li>
        <li>Rich inline menus, product catalogs, and admin panels with stateful buttons</li>
        <li>Anywhere you'd otherwise cram structured data into a delimited <code>callback_data</code> string</li>
      </ul>
      <Callout type="tip" title="Small payloads don't need the vault">
        For short, stable data (a numeric id, an action name) keep using the plain{' '}
        <code>{'.Button(text, "route:{id}")'}</code> with{' '}
        <code>{'[CallbackQuery("route:{id}")]'}</code> template routing. The vault shines when
        the payload is large or complex.
      </Callout>
    </>
  );
}
