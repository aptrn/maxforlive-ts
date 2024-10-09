# maxforlive-ts

Typescript library to ease developing for MaxforLive devices, especially Midi Generators and Transformators.

## How to use

You probably want to check out [how to use typescript in Max](https://github.com/aptrn/maxmsp-ts-example).

## Structure

This is a [turborepo monorepo](https://turbo.build/repo/docs) template with the following structure:

```
├── apps
│   └── maxmsp-test
└── packages
    ├── ableton-ts
    └── parameters-ts
```

- `ableton-ts`: Library to interact with Ableton Live Object Model
- `parameters-ts`: Library to manage MaxMsp UI
- `maxmsp-test`: Instance of [this template](https://github.com/aptrn/maxmsp-ts-example) to test libraries.
