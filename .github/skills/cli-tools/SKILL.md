---
name: cli-tools
description: Use modern Rust-based CLI tools (bat, ripgrep, fd, sd, eza) as interactive replacements for cat, grep, find, sed, and ls in developer terminal workflows.
license: MIT
compatibility: opencode

metadata:
  audience: developers
  workflow: terminal
  maturity: stable
---

# Modern CLI Tools

Use modern Rust-based command-line tools as ergonomic replacements for common Unix utilities when working **interactively** in the terminal.

This skill applies when exploring codebases, inspecting files, searching text, or navigating directories during development. It is not intended for POSIX-strict shell scripts or CI environments.

## Scope and Usage

* Interactive terminal sessions
* Local development environments
* Source code exploration and refactoring

Not intended for:

* Non-interactive shell scripts
* CI/CD pipelines
* Environments requiring strict POSIX compatibility

## Tool Mapping

| Legacy | Modern | Example Usage     | Primary Benefit                  |
| ------ | ------ | ----------------- | -------------------------------- |
| `cat`  | `bat`  | `bat file.ts`     | Syntax highlighting, paging      |
| `grep` | `rg`   | `rg "pattern"`    | Fast search, respects .gitignore |
| `find` | `fd`   | `fd -e ts`        | Simpler, safer defaults          |
| `sed`  | `sd`   | `sd old new file` | Readable find and replace        |
| `ls`   | `eza`  | `eza -la --git`   | Git-aware directory listings     |

## Examples

### Search

```bash
grep -R "useEffect" .
```

Suggested alternative:

```bash
rg "useEffect"
```

Reason: Faster recursive search and automatic exclusion of ignored directories.

---

### Directory listing

```bash
ls -la
```

Suggested alternative:

```bash
eza -la --git
```

Reason: Improved formatting with inline Git status.

## Notes

* Do not blindly alias legacy commands in shared or scripted environments.
* Prefer explicit usage (`rg`, `fd`, `eza`) over global overrides.
* Installation and environment setup are intentionally omitted from this skill.

## References

* bat — [https://github.com/sharkdp/bat](https://github.com/sharkdp/bat)
* ripgrep — [https://github.com/BurntSushi/ripgrep](https://github.com/BurntSushi/ripgrep)
* fd — [https://github.com/sharkdp/fd](https://github.com/sharkdp/fd)
* sd — [https://github.com/chmln/sd](https://github.com/chmln/sd)
* eza — [https://github.com/eza-community/eza](https://github.com/eza-community/eza)
