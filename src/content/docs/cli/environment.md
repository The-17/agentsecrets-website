# environment

## agentsecrets environment switch
```bash
agentsecrets environment switch <name>
```
Switches the active environment. Valid values: `development`, `staging`, `production`. Updates `.agentsecrets/project.json` in the current directory and the global config fallback. Invalid environment names are rejected with an error.

## agentsecrets environment list
```bash
agentsecrets environment list
```
Lists all three environments and the number of secrets in each for the current project.

## agentsecrets environment copy
```bash
agentsecrets environment copy <from> <to>
```
Copies all secrets from one environment to another with the same values. Prompts for confirmation if the destination has existing secrets.

## agentsecrets environment merge
```bash
agentsecrets environment merge <from> <to>
```
Takes key names from the source environment and prompts for new values in the destination. Press Enter to skip a key. Useful when production values differ from staging values.

## agentsecrets environment clean
```bash
agentsecrets environment clean
```
Deletes all secrets in the current environment. Permanent. Requires confirmation.
