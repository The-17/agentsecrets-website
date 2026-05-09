# log

## agentsecrets log list
```bash
agentsecrets log list
agentsecrets log list --tail
agentsecrets log list --agent NAME
agentsecrets log list --identity anonymous
```
Views the global backend audit log. `--tail` streams live. `--agent` filters by agent name. `--identity anonymous` finds calls with no agent identity set.

## agentsecrets log summary
```bash
agentsecrets log summary
agentsecrets log summary --since 7d
```
Aggregate statistics: call counts, top keys, top agents, error rates.

## agentsecrets log export
```bash
agentsecrets log export --format csv
agentsecrets log export --format json --since 30d
```
Exports audit log entries for compliance review or external analysis.

## agentsecrets log detail
```bash
agentsecrets log detail <entry-id>
```
Full detail for a specific log entry, including the domain allowlist snapshot at time of call.
