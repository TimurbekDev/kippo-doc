import { CodeBlock } from '../../../components/docs/CodeBlock';

const completeHandler = `public class MyHandler : BotUpdateHandler
{
    [Command("start")]
    public async Task Start(Context context)
    {
        var keyboard = ReplyKeyboardBuilder.Create()
            .Button("📝 Register")
            .Button("ℹ️ Info")
            .Row()
            .Button("❓ Help")
            .Resize()
            .Build();

        await context.Reply("🤖 *Welcome to Kippo Demo Bot!*\\n\\nChoose an option:", keyboard);
    }

    [Command("register")]
    [Text(Pattern = "📝 Register")]
    public async Task StartRegistration(Context context)
    {
        context.Session!.State = "ask_age";
        await context.Reply("👤 Let's get you registered! Please enter your age:");
    }

    [Text(State = "ask_age")]
    public async Task AskAge(Context context)
    {
        if (!int.TryParse(context.Message.Text, out var age) || age < 13 || age > 120)
        {
            await context.Reply("❌ Please enter a valid age (13-120).");
            return;
        }

        context.Session!.Data["age"] = age;
        context.Session.State = "ask_name";
        await context.Reply("✅ Great! Now, what's your name?");
    }

    [Text(State = "ask_name")]
    public async Task AskName(Context context)
    {
        context.Session!.Data["name"] = context.Message.Text;
        context.Session.State = "ask_country";

        var keyboard = InlineKeyboardBuilder.Create()
            .Button("🇺🇸 USA", "country_usa")
            .Button("🇬🇧 UK", "country_uk")
            .Row()
            .Button("🌍 Other", "country_other")
            .Build();

        await context.Reply($"Nice to meet you! Where are you from?", keyboard);
    }

    [CallbackQuery("country_*")]
    public async Task HandleCountry(Context context)
    {
        var country = context.Callback.Data.Replace("country_", "").ToUpper();
        context.Session!.Data["country"] = country;
        context.Session.State = null;

        await context.Callback.Answer();
        await context.Reply(
            $"🎉 Registration complete!\\n" +
            $"• Name: {context.Session.Data["name"]}\\n" +
            $"• Age: {context.Session.Data["age"]}\\n" +
            $"• Country: {country}");
    }

    [Text]
    public async Task GlobalTextHandler(Context context)
    {
        await context.Reply($"📝 You said: _{context.Message.Text}_\\n\\nUse /help for commands.");
    }
}`;

const programCs = `var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IUserService, UserService>();
builder.Services.AddKippo<MyHandler>(builder.Configuration)
                .AddKippoMiddleware<LoggingMiddleware>()
                .AddKippoMiddleware<SessionMiddleware>();

var app = builder.Build();
app.Run();`;

const echoBot = `public class EchoHandler : BotUpdateHandler
{
    [Command("start")]
    public async Task Start(Context context)
        => await context.Reply("Hi! I'm an echo bot. Send me any message!");

    [Text]
    public async Task Echo(Context context)
        => await context.Reply($"You said: {context.Message.Text}");
}`;

const pollBot = `public class PollHandler : BotUpdateHandler
{
    [Command("poll")]
    public async Task CreatePoll(Context context)
    {
        context.Session!.State = "poll_question";
        await context.Reply("📊 Let's create a poll!\\n\\nWhat's your question?");
    }

    [Text(State = "poll_question")]
    public async Task SetQuestion(Context context)
    {
        context.Session!.Data["question"] = context.Message.Text;
        context.Session.Data["options"] = new List<string>();
        context.Session.State = "poll_options";
        await context.Reply("Send options one by one. Send /done when finished.");
    }

    [Text(State = "poll_options")]
    public async Task AddOption(Context context)
    {
        var options = (List<string>)context.Session!.Data["options"];
        options.Add(context.Message.Text);
        await context.Reply($"✅ Added: {context.Message.Text}\\n\\nSend more or /done");
    }

    [Command("done")]
    public async Task FinishPoll(Context context)
    {
        if (context.Session?.State != "poll_options") return;

        var question = (string)context.Session.Data["question"];
        var options = (List<string>)context.Session.Data["options"];
        context.Session.State = null;

        var builder = InlineKeyboardBuilder.Create();
        for (int i = 0; i < options.Count; i++)
        {
            builder.Button(options[i], $"vote_{i}");
            if (i < options.Count - 1) builder.Row();
        }

        await context.Reply($"📊 *{question}*", builder.Build());
    }

    [CallbackQuery("vote_*")]
    public async Task HandleVote(Context context)
    {
        var index = context.Callback.Data.Replace("vote_", "");
        await context.Callback.Answer($"You voted for option {index}!");
    }
}`;

export default function Examples() {
  return (
    <>
      <h1>Examples</h1>
      <p className="lead">
        Complete, working examples demonstrating real-world Kippo bot patterns.
      </p>

      <h2>Program.cs</h2>
      <CodeBlock code={programCs} language="csharp" filename="Program.cs" />

      <h2>Complete handler</h2>
      <p>Full handler with registration flow, inline menus, and session management:</p>
      <CodeBlock code={completeHandler} language="csharp" filename="MyHandler.cs" />

      <h2>Echo bot</h2>
      <p>The simplest possible bot — echoes back any message:</p>
      <CodeBlock code={echoBot} language="csharp" filename="EchoHandler.cs" />

      <h2>Poll bot</h2>
      <p>Create simple polls with inline keyboards:</p>
      <CodeBlock code={pollBot} language="csharp" filename="PollHandler.cs" />
    </>
  );
}
