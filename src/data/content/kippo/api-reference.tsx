export default function ApiReference() {
  return (
    <>
      <h1>API Reference</h1>
      <p className="lead">
        Reference for Kippo's routing attributes, the Context type, and the keyboard
        builders.
      </p>

      <h2>Routing attributes</h2>
      <table>
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Parameters</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>[Command]</code></td>
            <td>command, Description?</td>
            <td>Handles a slash command (e.g. <code>/start</code>).</td>
          </tr>
          <tr>
            <td><code>[Text]</code></td>
            <td>Pattern?, Contains?, Regex?, State?</td>
            <td>Handles text messages with optional pattern and state matching.</td>
          </tr>
          <tr>
            <td><code>[CallbackQuery]</code></td>
            <td>pattern (supports <code>*</code>)</td>
            <td>Handles inline keyboard button presses.</td>
          </tr>
        </tbody>
      </table>

      <h2>Context</h2>
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>BotClient</code></td><td>ITelegramBotClient</td><td>Full Telegram Bot API access.</td></tr>
          <tr><td><code>Update</code></td><td>Update</td><td>Raw Telegram update.</td></tr>
          <tr><td><code>ChatId</code></td><td>long</td><td>Current chat id.</td></tr>
          <tr><td><code>Message</code></td><td>MessageContext</td><td>Message text and metadata.</td></tr>
          <tr><td><code>Callback</code></td><td>CallbackContext</td><td><code>Data</code> and <code>Answer(...)</code>.</td></tr>
          <tr><td><code>Session</code></td><td>Session?</td><td>Per-user session (with SessionMiddleware).</td></tr>
          <tr><td><code>Reply(text, markup?, parseMode?)</code></td><td>Task</td><td>Send a message to the current chat.</td></tr>
        </tbody>
      </table>

      <h2>ReplyKeyboardBuilder</h2>
      <table>
        <thead>
          <tr><th>Method</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>Button(text)</code></td><td>Add a text button.</td></tr>
          <tr><td><code>LocationButton(text)</code></td><td>Request the user's location.</td></tr>
          <tr><td><code>ContactButton(text)</code></td><td>Request the user's contact.</td></tr>
          <tr><td><code>Row()</code></td><td>Start a new row.</td></tr>
          <tr><td><code>Resize()</code></td><td>Auto-resize the keyboard.</td></tr>
          <tr><td><code>OneTime()</code></td><td>Hide after a button press.</td></tr>
          <tr><td><code>Placeholder(text)</code></td><td>Input placeholder text.</td></tr>
          <tr><td><code>Build()</code></td><td>Produce the keyboard markup.</td></tr>
        </tbody>
      </table>

      <h2>InlineKeyboardBuilder</h2>
      <table>
        <thead>
          <tr><th>Method</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>Button(text, callbackData)</code></td><td>Add a callback button.</td></tr>
          <tr><td><code>UrlButton(text, url)</code></td><td>Add a URL button.</td></tr>
          <tr><td><code>Row()</code></td><td>Start a new row.</td></tr>
          <tr><td><code>Build()</code></td><td>Produce the keyboard markup.</td></tr>
        </tbody>
      </table>

      <h2>ISessionStore</h2>
      <table>
        <thead>
          <tr><th>Method</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>GetAsync(chatId)</code></td><td>Load a session.</td></tr>
          <tr><td><code>SaveAsync(chatId, session)</code></td><td>Persist a session.</td></tr>
          <tr><td><code>DeleteAsync(chatId)</code></td><td>Remove a session.</td></tr>
        </tbody>
      </table>

      <h2>IBotMiddleware</h2>
      <table>
        <thead>
          <tr><th>Method</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>InvokeAsync(context, next)</code></td>
            <td>Run logic around the handler; call <code>next()</code> to continue the pipeline.</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
