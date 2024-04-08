# trovu-cli


**Proposal for restructuring Trovu in an object oriented manner.**

This code is just a proof of concept and not intended to be acutally used.

See https://trovu.net/ and https://trovu.net/docs/ for more information about Trovu.

## Goals

- Decouple components and add individual unit tests
- Make core logic usable by a CLI interface

## Installation

```
git clone https://github.com/stefanschramm/trovu-cli.git
cd trovu-cli
npm ci # install dependencies
npm run build # call TypeScript compiler
sudo npm install -g . # install command globally
```

## Usage (Examples)

```
trovu w Berlin
trovu en.w Berlin
trovu bvg Alexanderplatz, Hermannplatz
```
