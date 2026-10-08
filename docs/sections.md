# README sections

A README is a short route from “what is this?” to “I can use it.” Pick sections for a reader’s question, not to fill a template.

## The essentials

- **Overview:** what it does, who uses it, and a concrete reason to use it.
- **Quick start:** requirements, verified install commands, one working result. For a directory, this becomes how to browse or load the data.
- **Usage:** a real task with inputs and expected output. Link to full documentation for the rest.
- **License:** the actual terms for using the code or data. A repository being public is not a license.

A visual product should show a real **demo** near the top. A library needs a concise **API** example. A dataset needs **sources, methodology and a snapshot date**. Research needs **reproduction and citation**. Profiles need selected work and a way to get in touch.

## Additional sections

| Section | Reader question | Suitable components |
| --- | --- | --- |
| Features | Which concrete capabilities matter? | Feature index, columns, comparison |
| Demo | What does it look like or produce? | Screenshot, gallery, terminal output, demo link |
| Configuration | Which options and defaults do I need? | Table, code, expandable examples |
| API | What are the public inputs and outputs? | Code, table, docs link |
| Architecture | How do the parts fit? | Flow, stack or hub diagram |
| Requirements & limits | Will it work in my environment? | Alert, table, FAQ |
| Results & benchmarks | What evidence supports the claim? | Source-linked metrics, results table, real plot |
| Data & methodology | Where did this information come from? | Prose, source links, format table |
| Roadmap | What is shipped or planned? | Status checklist or timeline |
| FAQ | What recurring problem needs an answer? | Expandable details, alerts |
| Contributing | How can I report or improve something? | Issue links, concise contribution instructions |
| Credits & citation | Who should be credited? | Prose, citation code, links |

Do not add an empty roadmap, invented benchmarks, redundant badges, generic feature claims or a technology list that explains nothing. Keep detailed reference documentation in `docs/` and link to it.

## Agent workflow

```sh
open-readme projects --json
open-readme sections --json
open-readme init --project library --design plain
open-readme audit --config open-readme.json --json
```

Mark each block’s purpose with `section`, such as `"section": "quickstart"`. Several components can belong to one section. `audit` reports missing essential and recommended sections for the selected project type. It checks structure, not whether claims or commands are true; the agent must verify those in the repository.

References: [GitHub’s README guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes), [DataMade’s documentation template](https://github.com/datamade/readme-template), [dbader’s open-source template](https://github.com/dbader/readme-template). The project-specific rules above are open-readme’s design choices.
