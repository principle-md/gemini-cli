# Gemini CLI

Within Gemini CLI, `packages/cli` is the frontend for users to send and receive prompts with the Gemini AI model and its associated tools. For a general overview of Gemini CLI, see the [main documentation page](../index.md).

## Navigating this section

- **[Authentication](./authentication.md):** A guide to setting up authentication with Google's AI services.
- **[Commands](./commands.md):** A reference for Gemini CLI commands (e.g., `/help`, `/tools`, `/theme`).
- **[Configuration](./configuration.md):** A guide to tailoring Gemini CLI behavior using configuration files.
- **[Token Caching](./token-caching.md):** Optimize API costs through token caching.
- **[Themes](./themes.md)**: A guide to customizing the CLI's appearance with different themes.
- **[Tutorials](tutorials.md)**: A tutorial showing how to use Gemini CLI to automate a development task.

## Non-interactive mode

Gemini CLI can be run in a non-interactive mode, which is useful for scripting and automation. In this mode, you pipe input to the CLI, it executes the command, and then it exits.

The following example pipes a command to Gemini CLI from your terminal:

```bash
echo "What is fine tuning?" | gemini
```

Gemini CLI executes the command and prints the output to your terminal. Note that you can achieve the same behavior by using the `--prompt` or `-p` flag. For example:

```bash
gemini -p "What is fine tuning?"
```

## Resuming conversations

You can resume a previously saved conversation using the `--resume` or `-r` flag. This accepts either a numeric ID or a tag name:

```bash
# Resume by ID (from /chat list)
gemini --resume 1

# Resume by tag name
gemini --resume my-project

# Short form
gemini -r 2
```

This will load the conversation history and continue in interactive mode. Use `/chat list` within a session to see available conversations with their IDs and tags.
