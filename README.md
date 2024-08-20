# iam-generator

This project was created using `bun init` in bun v1.0.35. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

To install dependencies:

```bash
bun install
```

Available flags

```
--template: choose which template to use
--config: specify config file
--merge: merge config to single output

# if not specify --config, we can explicitly specify fields
--account-id, --region, --project, --stage (comma separate), --stack (comma separate)
```

To run:

With flags

```bash
node index.js --template sst_self_managed_stack --account-id 123 --region ap-south-1 --project gotenks --stage tanle --stack walless,pixeverse,api,workers --merge
```

Interactive

```bash
bun run index.js
# or
node index.js
```

With template and config

```bash
bun run index.js --template sst_update_stack --config config.json
# or
node index.js --template sst_update_stack --config config.json
```

Or not using config file

```bash
bun run index.js --template sst_update_stack
# or
node index.js --template sst_update_stack
```
