# Graphite Protocol

Status: `draft`

## Core Object

```json
{
  "protocol": "graphite/0.0",
  "kind": "object.kind",
  "created_at": "2026-06-26T00:00:00.000Z",
  "gate": {},
  "payload": {}
}
```

## Native Spaces

Graphite separates:

- ontology,
- claims,
- evidence,
- labs,
- governance,
- members,
- tools,
- metrics,
- protocol console.

## Authority Rule

```text
message != decision
decision != signed governance
lab != doctrine
claim != verified fact
health != trust
```

## Security Rule

Private state should be:

- local-first,
- token or session gated,
- signed where authority matters,
- externally reachable only through explicit deployment policy.

