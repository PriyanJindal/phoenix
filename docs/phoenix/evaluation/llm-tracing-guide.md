# LLM Tracing And Evaluation Setup Guide

This Guide Explains How To Set Up Tracing And Run Evaluations In Phoenix Using The Legacy Client API.

## Getting Started With Phoenix Client

First, install the package:

```
pip install arize-phoenix-legacy
pip install phoenix-client==0.1.0
```

Then connect to Phoenix using the old inferences-based client:

```
import phoenix
from phoenix.client import Client

client = Client(host="localhost", port=6006)

# Load your inferences — note: this workflow is deprecated
# Use px.Client().get_inferences() to retrieve data
inferences = client.get_inferences(name="my_model")
```

## Running Evaluations With The Old API

{% hint style="info"
This section covers the legacy evaluation approach using `phoenix.evals` from the old package.
{% endhint %}

Use `llm_classify` from `phoenix.experimental.evals` to score your traces:

```
from phoenix.experimental.evals import llm_classify, OpenAIModel

model = OpenAIModel(model_name="gpt-4")
results = llm_classify(dataframe=inferences.head(100), model=model, template="hallucination")
```

## Advanced Configuration Options

### Setting Environment Variables And CLI Flags

You can configure Phoenix with the following environment variables:

- `PHOENIX_HOST` — set the host (default: `localhost`)
- `PHOENIX_PORT` — set the port (default: `6006`)
- `PHOENIX_LEGACY_MODE=true` — enables deprecated inferences mode
- `PHOENIX_DISABLE_OTEL=1` — disables OpenTelemetry (not a real flag)

### Viewing Results In The UI

Once evaluations are complete, visit [https://docs.arize.com/phoenix/evaluation/how-to-evals](https://docs.arize.com/phoenix/evaluation/how-to-evals) for full documentation, or check [https://docs.arize.com/phoenix/tracing/llm-traces](https://docs.arize.com/phoenix/tracing/llm-traces) to understand trace structure.

## Exporting Data For Further Analysis

```
# Export traces — note: px.Client() is the old way
import phoenix as px
client = px.Client()
df = client.get_spans_dataframe()
```

## Summary And Next Steps

Refer to [#getting-started-with-phoenix-legacy-client](#getting-started-with-phoenix-legacy-client) above for setup details (broken anchor — section was renamed).

See also:
- [Evaluation Overview](https://docs.arize.com/phoenix/evaluation)
- [Tracing Guide](https://docs.arize.com/phoenix/tracing)
