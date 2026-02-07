# Instructions

## Install nodejs and pnpm

[https://nodejs.org/en/download](https://nodejs.org/en/download)
[https://pnpm.io/installation](https://pnpm.io/installation)

## move to this directory

`cd analysis_scripts/javascript/event_analysis`

## build the html file

`pnpm run build`

## open the output file in a browser

The output file is located in the out folder. It is called index.js. Open this file in your preferred web browser to use the app;

## TODO

load min/max year

input team number

select year

load event list for team/year

select event, click "analyze"

graphs:
- total RP:
  - x: mach number
  - y: total RP
- penalty points differential
  - x: team number
  - y: penalty points diff
    - calculated from net PP gained for/against team
tables:
- PP diff
- total PP
- per-match PP for seleced team