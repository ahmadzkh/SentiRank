# IndoBERT Artifact Export Workflow

## Scope

MS-11B prepares the SentiRank IndoBERT training/export workflow. It does not train IndoBERT locally and does not change `sentiment-service` runtime behavior.

The selected configuration remains:

```text
run_3_weighted_loss_lr_1e-5
```

Older run_3 metrics are historical until this configuration is re-trained and evaluated with processed splits regenerated after the text quality filtering update.

## Run 3 Configuration Audit

| Item | Value |
| --- | --- |
| Base pretrained model | `indobenchmark/indobert-base-p1` |
| Run name | `run_3_weighted_loss_lr_1e-5` |
| Loss | Balanced class-weighted cross entropy |
| Class weights | Computed from the train split with `compute_class_weight(class_weight="balanced")` |
| Learning rate | `1e-5` |
| Batch size | `16` |
| Epochs | `3` |
| Max sequence length | `128` |
| Random seed | `42` |
| Splits | `datasets/processed/indobert/train.csv`, `validation.csv`, `test.csv` |
| Label mapping | `datasets/processed/indobert/label_mapping.json` |
| Optimizer/scheduler | Hugging Face Trainer defaults: AdamW + linear schedule |
| Evaluation metrics | Accuracy, macro/weighted precision, macro/weighted recall, macro/weighted F1, loss |
| Checkpoints | `ml-service/saved_models/indobert/run_3_weighted_loss_lr_1e-5/checkpoints/` |
| Export artifact | `ml-service/saved_models/indobert/run_3_weighted_loss_lr_1e-5/` |

## Colab Workflow

1. Upload or sync the SentiRank project folder to Google Drive.
2. Open `ml-service/notebooks/03c_indobert_weighted_loss_lr1e5_colab_training.ipynb`.
3. Use a GPU runtime.
4. Install notebook packages: `transformers`, `datasets`, `evaluate`, `accelerate`, `safetensors`, `huggingface_hub`, `scikit-learn`, `pandas`, and `matplotlib`.
5. Mount Google Drive and set `DRIVE_PROJECT_DIR`.
6. Load `datasets/processed/indobert/` splits and `label_mapping.json`.
7. Train run_3 with weighted loss and learning rate `1e-5`.
8. Evaluate on the test split.
9. Export the final model with `trainer.save_model(...)` and `tokenizer.save_pretrained(...)`.
10. Verify the artifact with `AutoTokenizer.from_pretrained(export_dir)` and `AutoModelForSequenceClassification.from_pretrained(export_dir)`.
11. Zip the artifact folder for download.
12. Optionally upload the artifact to a private Hugging Face Hub repository.

Do not paste Hugging Face tokens into notebook cells. Use `HF_TOKEN` from Colab secrets or an environment variable.

## CLI Workflow

Dry-run validation from the repository root:

```bash
python ml-service/scripts/train_indobert.py --dry-run
```

Full training should be run in Colab or another GPU environment:

```bash
python ml-service/scripts/train_indobert.py
```

Optional private Hugging Face upload after training:

```bash
python ml-service/scripts/train_indobert.py \
  --push-to-hub \
  --hf-repo-id your-username/sentirank-indobert-run-3 \
  --hf-private \
  --hf-token-env HF_TOKEN
```

Upload is disabled by default. If `--push-to-hub` is set and the token environment variable is missing, the script fails with a clear error and does not print the token.

## Expected Artifact Structure

Expected folder:

```text
ml-service/saved_models/indobert/run_3_weighted_loss_lr_1e-5/
```

Expected files:

```text
config.json
model.safetensors or pytorch_model.bin
tokenizer.json if supported
tokenizer_config.json
special_tokens_map.json
vocab.txt or equivalent tokenizer vocabulary
eval_metrics.json
label_mapping.json
preprocessing_config.json
training_config.json
README.md
```

`eval_metrics.json` includes run name, selected configuration, dataset source/version, preprocessing version, split row counts, accuracy, precision, recall, F1, loss when available, generation timestamp, and notes about the preprocessing update.

`preprocessing_config.json` records the pipeline name/version, text quality filtering status, filtering rules, input dataset path, processed split path, and dropped/noise report path when available.

`training_config.json` records run name, base model, learning rate, batch size, epochs, max length, weighted loss flag, class weights, random seed, split paths, checkpoint output, and export directory.

## Local Artifact Validation

After the artifact exists:

```bash
python ml-service/scripts/validate_indobert_artifact.py \
  --model-dir ml-service/saved_models/indobert/run_3_weighted_loss_lr_1e-5
```

The validator checks required files, loads tokenizer and model with Transformers, and runs one CPU sample inference.

## Sentiment-Service Integration Note

This milestone prepares the artifact only. A later milestone can wire `sentiment-service` to either a local artifact folder or a Hugging Face model ID. Until that runtime integration is implemented, `sentiment-service` may still return explicit fallback output when no mounted model artifact is available.
